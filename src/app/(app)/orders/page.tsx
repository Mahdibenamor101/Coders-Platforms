import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge, EmptyState, LinkButton } from "@/components/ui";
import { AutoPlanButton } from "@/components/auto-plan-button";

export default async function OrdersPage() {
  const session = await requireSession();
  const orders = await prisma.order.findMany({
    where: { companyId: session.companyId },
    include: { trip: { include: { driver: true } } },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commandes"
        description="Commandes clients a livrer : priorite, fenetres horaires, competences requises."
        action={<LinkButton href="/orders/new">+ Nouvelle commande</LinkButton>}
      />

      <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm font-medium text-slate-800">
            {pendingCount} commande(s) en attente d&apos;assignation
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Le moteur de planification assigne automatiquement les commandes aux tournees disponibles
            (competences, capacite, certification ADR, distance) et sequence les arrets.
          </p>
        </div>
        <AutoPlanButton />
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Aucune commande enregistree"
          description="Creez une commande client pour pouvoir la planifier automatiquement."
          action={<LinkButton href="/orders/new">+ Nouvelle commande</LinkButton>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Trajet</th>
                <th className="px-4 py-3">Priorite</th>
                <th className="px-4 py-3">Tournee</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{order.reference}</td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {order.pickupAddress} → {order.deliveryAddress}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={order.priority} /></td>
                  <td className="px-4 py-3">
                    {order.trip ? (
                      <Link href={`/trips/${order.trip.id}`} className="text-emerald-700 hover:underline">
                        {order.trip.driver.firstName} {order.trip.driver.lastName}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/orders/${order.id}`} className="font-medium text-emerald-700 hover:underline">
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
