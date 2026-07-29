import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import {
  notifyTripDriverAction,
  updateTripStatusAction,
  deleteTripAction,
} from "@/lib/actions/trip-actions";
import { formatDateTime } from "@/lib/format";

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const trip = await prisma.trip.findFirst({
    where: { id: params.id, companyId: session.companyId },
    include: { driver: true, tractor: true, trailer: true },
  });
  if (!trip) notFound();

  const messages = await prisma.whatsAppMessage.findMany({
    where: { companyId: session.companyId, driverId: trip.driverId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const boundNotify = notifyTripDriverAction.bind(null, trip.id);
  const boundDelete = deleteTripAction.bind(null, trip.id);
  const boundStart = updateTripStatusAction.bind(null, trip.id, "IN_PROGRESS");
  const boundComplete = updateTripStatusAction.bind(null, trip.id, "COMPLETED");
  const boundCancel = updateTripStatusAction.bind(null, trip.id, "CANCELLED");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={`${trip.origin} → ${trip.destination}`}
        action={<DeleteButton action={boundDelete} confirmMessage="Supprimer cette mission ?" />}
      />

      <div className="card grid grid-cols-2 gap-4 p-6 text-sm">
        <div>
          <div className="label">Statut</div>
          <StatusBadge status={trip.status} />
        </div>
        <div>
          <div className="label">Chauffeur</div>
          <div>{trip.driver.firstName} {trip.driver.lastName} ({trip.driver.phone})</div>
        </div>
        <div>
          <div className="label">Tracteur</div>
          <div>{trip.tractor.plateNumber} - {trip.tractor.brand} {trip.tractor.model}</div>
        </div>
        <div>
          <div className="label">Remorque</div>
          <div>{trip.trailer ? trip.trailer.plateNumber : "Aucune"}</div>
        </div>
        <div>
          <div className="label">Depart prevu</div>
          <div>{formatDateTime(trip.departureAt)}</div>
        </div>
        <div>
          <div className="label">Arrivee estimee</div>
          <div>{formatDateTime(trip.estimatedArrivalAt)}</div>
        </div>
        <div>
          <div className="label">Marchandise</div>
          <div>{trip.cargoDescription || "-"}</div>
        </div>
        <div>
          <div className="label">Chauffeur notifie</div>
          <div>{trip.driverNotifiedAt ? formatDateTime(trip.driverNotifiedAt) : "Non"}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <form action={boundNotify}>
          <button className="btn-secondary" type="submit">Notifier via WhatsApp</button>
        </form>
        {trip.status === "PLANNED" && (
          <form action={boundStart}>
            <button className="btn-primary" type="submit">Demarrer la mission</button>
          </form>
        )}
        {trip.status === "IN_PROGRESS" && (
          <form action={boundComplete}>
            <button className="btn-primary" type="submit">Marquer terminee</button>
          </form>
        )}
        {trip.status !== "COMPLETED" && trip.status !== "CANCELLED" && (
          <form action={boundCancel}>
            <button className="btn-danger" type="submit">Annuler</button>
          </form>
        )}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Messages WhatsApp au chauffeur</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun message envoye.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {messages.map((m) => (
              <li key={m.id} className="py-3">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-800">{m.type}</span>
                  <span className="text-slate-500">{formatDateTime(m.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-slate-500">{m.body}</p>
                <p className="mt-1 text-xs uppercase text-slate-400">{m.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
