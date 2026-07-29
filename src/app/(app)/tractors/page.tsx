import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge, EmptyState, LinkButton } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function TractorsPage() {
  const session = await requireSession();
  const tractors = await prisma.tractor.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Tracteurs"
        description="Gerez votre parc de tracteurs routiers."
        action={<LinkButton href="/tractors/new">+ Nouveau tracteur</LinkButton>}
      />

      {tractors.length === 0 ? (
        <EmptyState
          title="Aucun tracteur enregistre"
          description="Ajoutez votre premier tracteur pour commencer a planifier des missions."
          action={<LinkButton href="/tractors/new">+ Nouveau tracteur</LinkButton>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Immatriculation</th>
                <th className="px-4 py-3">Marque / Modele</th>
                <th className="px-4 py-3">Kilometrage</th>
                <th className="px-4 py-3">Prochain entretien</th>
                <th className="px-4 py-3">Controle technique</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tractors.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.plateNumber}</td>
                  <td className="px-4 py-3">{t.brand} {t.model}{t.year ? ` (${t.year})` : ""}</td>
                  <td className="px-4 py-3">{t.mileage.toLocaleString("fr-FR")} km</td>
                  <td className="px-4 py-3">
                    {t.nextMaintenanceMileage ? `${t.nextMaintenanceMileage.toLocaleString("fr-FR")} km` : "-"}
                  </td>
                  <td className="px-4 py-3">{formatDate(t.technicalControlExpiry)}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/tractors/${t.id}`} className="font-medium text-emerald-700 hover:underline">
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
