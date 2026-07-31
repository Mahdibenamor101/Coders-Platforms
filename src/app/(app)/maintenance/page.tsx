import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, LinkButton } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { deleteMaintenanceAction } from "@/lib/actions/maintenance-actions";
import { FlashBanner } from "@/components/flash-banner";
import { formatDate } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  OIL_CHANGE: "Vidange",
  TIRES: "Pneus",
  BRAKES: "Freins",
  INSPECTION: "Inspection",
  REPAIR: "Reparation",
  OTHER: "Autre",
};

export default async function MaintenancePage() {
  const session = await requireSession();
  const records = await prisma.maintenanceRecord.findMany({
    where: { companyId: session.companyId },
    include: { tractor: true, trailer: true },
    orderBy: { performedAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Entretien"
        description="Historique des entretiens et prochaines echeances."
        action={<LinkButton href="/maintenance/new">+ Nouvel entretien</LinkButton>}
      />

      <Suspense fallback={null}>
        <FlashBanner />
      </Suspense>

      {records.length === 0 ? (
        <EmptyState
          title="Aucun entretien enregistre"
          description="Enregistrez les entretiens de vos tracteurs et remorques pour suivre les echeances."
          action={<LinkButton href="/maintenance/new">+ Nouvel entretien</LinkButton>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Vehicule</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Kilometrage</th>
                <th className="px-4 py-3">Cout</th>
                <th className="px-4 py-3">Prochaine echeance</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {r.tractor ? `Tracteur ${r.tractor.plateNumber}` : r.trailer ? `Remorque ${r.trailer.plateNumber}` : "-"}
                  </td>
                  <td className="px-4 py-3">{TYPE_LABELS[r.type] ?? r.type}</td>
                  <td className="px-4 py-3">{formatDate(r.performedAt)}</td>
                  <td className="px-4 py-3">{r.mileage ? `${r.mileage.toLocaleString("fr-FR")} km` : "-"}</td>
                  <td className="px-4 py-3">{r.cost ? `${r.cost.toFixed(2)} €` : "-"}</td>
                  <td className="px-4 py-3">
                    {r.nextDueAt ? formatDate(r.nextDueAt) : r.nextDueMileage ? `${r.nextDueMileage.toLocaleString("fr-FR")} km` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      action={deleteMaintenanceAction.bind(null, r.id)}
                      confirmMessage="Supprimer cet entretien ?"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
