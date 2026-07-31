import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, LinkButton } from "@/components/ui";
import { AutoPlanButton } from "@/components/auto-plan-button";
import { OrdersTable } from "@/components/tables/orders-table";
import { FlashBanner } from "@/components/flash-banner";

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

      <Suspense fallback={null}>
        <FlashBanner />
      </Suspense>

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
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
