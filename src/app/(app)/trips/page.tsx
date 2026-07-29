import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge, EmptyState, LinkButton } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default async function TripsPage() {
  const session = await requireSession();
  const trips = await prisma.trip.findMany({
    where: { companyId: session.companyId },
    include: { driver: true, tractor: true, trailer: true },
    orderBy: { departureAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Missions"
        description="Planifiez et suivez les missions de transport."
        action={<LinkButton href="/trips/new">+ Nouvelle mission</LinkButton>}
      />

      {trips.length === 0 ? (
        <EmptyState
          title="Aucune mission planifiee"
          description="Creez une mission pour assigner un tracteur, une remorque et un chauffeur."
          action={<LinkButton href="/trips/new">+ Nouvelle mission</LinkButton>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Trajet</th>
                <th className="px-4 py-3">Chauffeur</th>
                <th className="px-4 py-3">Tracteur / Remorque</th>
                <th className="px-4 py-3">Depart</th>
                <th className="px-4 py-3">Notifie</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {trip.origin} → {trip.destination}
                  </td>
                  <td className="px-4 py-3">{trip.driver.firstName} {trip.driver.lastName}</td>
                  <td className="px-4 py-3">
                    {trip.tractor.plateNumber}
                    {trip.trailer ? ` / ${trip.trailer.plateNumber}` : ""}
                  </td>
                  <td className="px-4 py-3">{formatDateTime(trip.departureAt)}</td>
                  <td className="px-4 py-3">{trip.driverNotifiedAt ? "✅" : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/trips/${trip.id}`} className="font-medium text-emerald-700 hover:underline">
                      Details
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
