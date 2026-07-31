import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, LinkButton } from "@/components/ui";
import { TripsTable } from "@/components/tables/trips-table";
import { FlashBanner } from "@/components/flash-banner";

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

      <Suspense fallback={null}>
        <FlashBanner />
      </Suspense>

      {trips.length === 0 ? (
        <EmptyState
          title="Aucune mission planifiee"
          description="Creez une mission pour assigner un tracteur, une remorque et un chauffeur."
          action={<LinkButton href="/trips/new">+ Nouvelle mission</LinkButton>}
        />
      ) : (
        <TripsTable trips={trips} />
      )}
    </div>
  );
}
