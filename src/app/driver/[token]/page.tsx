import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui";
import { LocationReporter } from "@/components/location-reporter";
import { formatDateTime } from "@/lib/format";

export default async function DriverPortalPage({ params }: { params: { token: string } }) {
  const driver = await prisma.driver.findUnique({ where: { accessToken: params.token } });
  if (!driver) notFound();

  const trips = await prisma.trip.findMany({
    where: { driverId: driver.id, status: { in: ["PLANNED", "IN_PROGRESS"] } },
    include: {
      tractor: true,
      trailer: true,
      orders: { orderBy: { sequence: "asc" } },
    },
    orderBy: { departureAt: "asc" },
  });

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-50 px-4 py-6">
      <LocationReporter token={params.token} />
      <header className="mb-6">
        <p className="text-sm text-slate-500">Bonjour</p>
        <h1 className="text-xl font-bold text-slate-900">{driver.firstName} {driver.lastName}</h1>
      </header>

      {trips.length === 0 ? (
        <div className="card p-6 text-center text-sm text-slate-500">
          Aucune tournee assignee pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">
                  {trip.tractor.plateNumber}
                  {trip.trailer ? ` / ${trip.trailer.plateNumber}` : ""}
                </span>
                <StatusBadge status={trip.status} />
              </div>
              <p className="mb-3 text-xs text-slate-500">
                Depart {formatDateTime(trip.departureAt)} · {trip.origin} → {trip.destination}
              </p>

              {trip.orders.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun arret assigne.</p>
              ) : (
                <ul className="space-y-2">
                  {trip.orders.map((order, idx) => (
                    <li key={order.id}>
                      <Link
                        href={`/driver/${params.token}/orders/${order.id}`}
                        className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                      >
                        <span className="text-sm">
                          <span className="mr-2 font-semibold text-slate-400">{idx + 1}.</span>
                          {order.customerName} - {order.deliveryAddress}
                        </span>
                        <StatusBadge status={order.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
