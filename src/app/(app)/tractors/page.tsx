import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, LinkButton } from "@/components/ui";
import { TractorsTable } from "@/components/tables/tractors-table";
import { FlashBanner } from "@/components/flash-banner";

export default async function TractorsPage() {
  const session = await requireSession();
  const tractors = await prisma.tractor.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Tracteurs"
        description="Gerez votre parc de tracteurs routiers."
        action={<LinkButton href="/tractors/new">+ Nouveau tracteur</LinkButton>}
      />

      <Suspense fallback={null}>
        <FlashBanner />
      </Suspense>

      {tractors.length === 0 ? (
        <EmptyState
          title="Aucun tracteur enregistre"
          description="Ajoutez votre premier tracteur pour commencer a planifier des missions."
          action={<LinkButton href="/tractors/new">+ Nouveau tracteur</LinkButton>}
        />
      ) : (
        <TractorsTable tractors={tractors} />
      )}
    </div>
  );
}
