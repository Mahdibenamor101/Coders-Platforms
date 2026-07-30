import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui";
import { PodForm } from "@/components/forms/pod-form";
import {
  startOrderAction,
  failOrderAction,
  submitProofOfDeliveryAction,
} from "@/lib/actions/driver-portal-actions";
import { formatDateTime } from "@/lib/format";

export default async function DriverOrderPage({
  params,
}: {
  params: { token: string; orderId: string };
}) {
  const driver = await prisma.driver.findUnique({ where: { accessToken: params.token } });
  if (!driver) notFound();

  const order = await prisma.order.findFirst({
    where: { id: params.orderId, trip: { driverId: driver.id } },
  });
  if (!order) notFound();

  const boundStart = startOrderAction.bind(null, params.token, order.id);
  const boundFail = failOrderAction.bind(null, params.token, order.id);
  const boundPod = submitProofOfDeliveryAction.bind(null, params.token, order.id);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-50 px-4 py-6">
      <Link href={`/driver/${params.token}`} className="mb-4 inline-block text-sm text-emerald-700">
        ← Retour a mes tournees
      </Link>

      <div className="card mb-4 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">{order.reference}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-sm text-slate-600">{order.customerName}</p>
        {order.customerPhone && <p className="text-sm text-slate-500">{order.customerPhone}</p>}
        <div className="mt-3 space-y-1 text-sm">
          <p><span className="text-slate-400">Enlevement :</span> {order.pickupAddress}</p>
          <p><span className="text-slate-400">Livraison :</span> {order.deliveryAddress}</p>
        </div>
        {order.hazmat && (
          <p className="mt-2 text-xs font-medium text-red-600">⚠ Matiere dangereuse - suivre les procedures ADR</p>
        )}
      </div>

      {order.status === "ASSIGNED" && (
        <form action={boundStart}>
          <button type="submit" className="btn-primary w-full">Demarrer cette livraison</button>
        </form>
      )}

      {order.status === "IN_PROGRESS" && (
        <div className="space-y-4">
          <PodForm action={boundPod} />
          <form action={boundFail} className="card space-y-2 p-4">
            <label className="label" htmlFor="reason">Signaler un probleme (livraison impossible)</label>
            <textarea className="input" id="reason" name="reason" rows={2} />
            <button type="submit" className="btn-danger w-full">Marquer comme echouee</button>
          </form>
        </div>
      )}

      {(order.status === "DELIVERED" || order.status === "FAILED") && (
        <div className="card p-4 text-sm text-slate-600">
          {order.status === "DELIVERED"
            ? `Livree le ${formatDateTime(order.deliveredAt)}`
            : `Echec de livraison : ${order.podNotes ?? "aucun detail"}`}
        </div>
      )}
    </div>
  );
}
