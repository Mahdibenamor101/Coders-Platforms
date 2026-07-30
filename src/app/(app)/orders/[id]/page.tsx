import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge } from "@/components/ui";
import { OrderForm } from "@/components/forms/order-form";
import { DeleteButton } from "@/components/delete-button";
import {
  updateOrderAction,
  deleteOrderAction,
  unassignOrderAction,
} from "@/lib/actions/order-actions";
import { toDateTimeInputValue, formatDateTime } from "@/lib/format";

export default async function EditOrderPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const order = await prisma.order.findFirst({
    where: { id: params.id, companyId: session.companyId },
    include: { trip: { include: { driver: true, tractor: true } } },
  });
  if (!order) notFound();

  const boundUpdate = updateOrderAction.bind(null, order.id);
  const boundDelete = deleteOrderAction.bind(null, order.id);
  const boundUnassign = unassignOrderAction.bind(null, order.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={order.reference}
        action={<DeleteButton action={boundDelete} confirmMessage="Supprimer cette commande ?" />}
      />

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <StatusBadge status={order.status} />
        <StatusBadge status={order.priority} />
        {order.hazmat && <span className="badge bg-red-100 text-red-700">Matiere dangereuse</span>}
        {(order.pickupLat == null || order.deliveryLat == null) && (
          <span className="badge bg-amber-100 text-amber-700">Adresse non geolocalisee</span>
        )}
      </div>

      {order.trip && (
        <div className="card flex items-center justify-between p-4 text-sm">
          <div>
            Assignee a la tournee de{" "}
            <Link href={`/trips/${order.trip.id}`} className="font-medium text-emerald-700 hover:underline">
              {order.trip.driver.firstName} {order.trip.driver.lastName}
            </Link>{" "}
            ({order.trip.tractor.plateNumber})
          </div>
          <form action={boundUnassign}>
            <button className="btn-secondary" type="submit">Retirer de la tournee</button>
          </form>
        </div>
      )}

      <OrderForm
        action={boundUpdate}
        defaults={{
          reference: order.reference,
          customerName: order.customerName,
          customerPhone: order.customerPhone ?? "",
          pickupAddress: order.pickupAddress,
          deliveryAddress: order.deliveryAddress,
          priority: order.priority,
          requiredSkills: order.requiredSkills,
          serviceDurationMin: order.serviceDurationMin,
          timeWindowStart: toDateTimeInputValue(order.timeWindowStart),
          timeWindowEnd: toDateTimeInputValue(order.timeWindowEnd),
          weightKg: order.weightKg,
          hazmat: order.hazmat,
        }}
      />

      {order.status === "DELIVERED" && (
        <div className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Preuve de livraison</h2>
          <p className="text-sm text-slate-500">Livree le {formatDateTime(order.deliveredAt)}</p>
          {order.podSignature && (
            <div className="mt-3">
              <p className="label">Signature</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.podSignature} alt="Signature du client" className="h-24 rounded border border-slate-200 bg-white" />
            </div>
          )}
          {order.podPhotoPath && (
            <div className="mt-3">
              <p className="label">Photo</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.podPhotoPath} alt="Photo de livraison" className="max-h-64 rounded border border-slate-200" />
            </div>
          )}
          {order.podBarcode && (
            <p className="mt-3 text-sm">
              <span className="label inline">Code-barres scanne : </span>
              <code className="rounded bg-slate-100 px-2 py-1">{order.podBarcode}</code>
            </p>
          )}
          {order.podNotes && <p className="mt-3 text-sm text-slate-600">{order.podNotes}</p>}
          {order.customerRating ? (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-slate-800">
                Avis client : {"★".repeat(order.customerRating)}{"☆".repeat(5 - order.customerRating)}
              </p>
              {order.customerFeedback && (
                <p className="mt-1 text-sm text-slate-600">{order.customerFeedback}</p>
              )}
            </div>
          ) : (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
              Pas encore d&apos;avis client. Lien : /feedback/{order.feedbackToken}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
