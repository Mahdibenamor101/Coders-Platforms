import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, LinkButton } from "@/components/ui";
import { TrailersTable } from "@/components/tables/trailers-table";
import { FlashBanner } from "@/components/flash-banner";

export default async function TrailersPage() {
  const session = await requireSession();
  const trailers = await prisma.trailer.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Remorques"
        description="Gerez votre parc de remorques."
        action={<LinkButton href="/trailers/new">+ Nouvelle remorque</LinkButton>}
      />

      <Suspense fallback={null}>
        <FlashBanner />
      </Suspense>

      {trailers.length === 0 ? (
        <EmptyState
          title="Aucune remorque enregistree"
          description="Ajoutez votre premiere remorque pour l'associer a des missions."
          action={<LinkButton href="/trailers/new">+ Nouvelle remorque</LinkButton>}
        />
      ) : (
        <TrailersTable trailers={trailers} />
      )}
    </div>
  );
}
