import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge, EmptyState } from "@/components/ui";
import {
  generateRecommendationsAction,
  resolveRecommendationAction,
  sendRecommendationWhatsAppAction,
} from "@/lib/actions/recommendation-actions";
import { formatDate, formatDateTime } from "@/lib/format";

const CATEGORY_LABELS: Record<string, string> = {
  MAINTENANCE: "Entretien",
  DOCUMENT_EXPIRY: "Document",
  DRIVER_HOURS: "Temps de conduite",
  INSPECTION: "Inspection",
  TRIP_REMINDER: "Rappel de mission",
};

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };

export default async function RecommendationsPage() {
  const session = await requireSession();
  const [unresolved, resolved] = await Promise.all([
    prisma.recommendation.findMany({ where: { companyId: session.companyId, resolved: false } }),
    prisma.recommendation.findMany({
      where: { companyId: session.companyId, resolved: true },
      orderBy: { resolvedAt: "desc" },
      take: 10,
    }),
  ]);

  const sorted = [...unresolved].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const canNotify = (entityType: string) => entityType === "DRIVER" || entityType === "TRIP";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Recommandations"
        description="Alertes generees automatiquement : entretien, documents, temps de conduite, rappels de mission."
        action={
          <form action={generateRecommendationsAction}>
            <button className="btn-secondary" type="submit">Regenerer maintenant</button>
          </form>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState title="Aucune recommandation active" description="Tout est en ordre pour le moment." />
      ) : (
        <div className="space-y-3">
          {sorted.map((rec) => (
            <div key={rec.id} className="card flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={rec.severity} />
                  <span className="badge bg-slate-100 text-slate-600">{CATEGORY_LABELS[rec.category] ?? rec.category}</span>
                  <span className="text-sm font-semibold text-slate-900">{rec.title}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{rec.message}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {rec.entityLabel}
                  {rec.dueAt ? ` · Echeance : ${formatDate(rec.dueAt)}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {canNotify(rec.entityType) && (
                  <form action={sendRecommendationWhatsAppAction.bind(null, rec.id)}>
                    <button className="btn-secondary" type="submit">Envoyer WhatsApp</button>
                  </form>
                )}
                <form action={resolveRecommendationAction.bind(null, rec.id)}>
                  <button className="btn-primary" type="submit">Marquer resolu</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Recemment resolues</h2>
          <div className="card divide-y divide-slate-100">
            {resolved.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-slate-600">{rec.title} · {rec.entityLabel}</span>
                <span className="text-xs text-slate-400">{formatDateTime(rec.resolvedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
