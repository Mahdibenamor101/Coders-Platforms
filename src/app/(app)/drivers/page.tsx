import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge, EmptyState, LinkButton } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function DriversPage() {
  const session = await requireSession();
  const drivers = await prisma.driver.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Chauffeurs"
        description="Gerez vos chauffeurs et leurs coordonnees WhatsApp."
        action={<LinkButton href="/drivers/new">+ Nouveau chauffeur</LinkButton>}
      />

      {drivers.length === 0 ? (
        <EmptyState
          title="Aucun chauffeur enregistre"
          description="Ajoutez vos chauffeurs pour pouvoir leur assigner des missions et les notifier par WhatsApp."
          action={<LinkButton href="/drivers/new">+ Nouveau chauffeur</LinkButton>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Telephone</th>
                <th className="px-4 py-3">Permis</th>
                <th className="px-4 py-3">Expiration permis</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{d.firstName} {d.lastName}</td>
                  <td className="px-4 py-3">{d.phone}</td>
                  <td className="px-4 py-3">{d.licenseNumber}</td>
                  <td className="px-4 py-3">{formatDate(d.licenseExpiry)}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/drivers/${d.id}`} className="font-medium text-emerald-700 hover:underline">
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
