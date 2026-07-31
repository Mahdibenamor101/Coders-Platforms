import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, LinkButton } from "@/components/ui";
import { DriversTable } from "@/components/tables/drivers-table";
import { FlashBanner } from "@/components/flash-banner";

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

      <Suspense fallback={null}>
        <FlashBanner />
      </Suspense>

      {drivers.length === 0 ? (
        <EmptyState
          title="Aucun chauffeur enregistre"
          description="Ajoutez vos chauffeurs pour pouvoir leur assigner des missions et les notifier par WhatsApp."
          action={<LinkButton href="/drivers/new">+ Nouveau chauffeur</LinkButton>}
        />
      ) : (
        <DriversTable drivers={drivers} />
      )}
    </div>
  );
}
