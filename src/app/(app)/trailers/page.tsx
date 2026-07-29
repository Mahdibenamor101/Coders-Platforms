import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge, EmptyState, LinkButton } from "@/components/ui";
import { formatDate } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  CURTAIN: "Tautliner / Bache",
  REEFER: "Frigorifique",
  FLATBED: "Plateau",
  TANK: "Citerne",
  CONTAINER: "Porte-conteneur",
  TIPPER: "Benne",
};

export default async function TrailersPage() {
  const session = await requireSession();
  const trailers = await prisma.trailer.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Remorques"
        description="Gerez votre parc de remorques."
        action={<LinkButton href="/trailers/new">+ Nouvelle remorque</LinkButton>}
      />

      {trailers.length === 0 ? (
        <EmptyState
          title="Aucune remorque enregistree"
          description="Ajoutez votre premiere remorque pour l'associer a des missions."
          action={<LinkButton href="/trailers/new">+ Nouvelle remorque</LinkButton>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Immatriculation</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Capacite</th>
                <th className="px-4 py-3">Prochaine inspection</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trailers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.plateNumber}</td>
                  <td className="px-4 py-3">{TYPE_LABELS[t.type] ?? t.type}</td>
                  <td className="px-4 py-3">{t.capacityTons ? `${t.capacityTons} t` : "-"}</td>
                  <td className="px-4 py-3">{formatDate(t.nextInspectionDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/trailers/${t.id}`} className="font-medium text-emerald-700 hover:underline">
                      Modifier
                    </Link>
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
