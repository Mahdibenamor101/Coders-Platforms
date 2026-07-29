import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { TrailerForm } from "@/components/forms/trailer-form";
import { DeleteButton } from "@/components/delete-button";
import { updateTrailerAction, deleteTrailerAction } from "@/lib/actions/trailer-actions";
import { toDateInputValue } from "@/lib/format";

export default async function EditTrailerPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const trailer = await prisma.trailer.findFirst({
    where: { id: params.id, companyId: session.companyId },
  });
  if (!trailer) notFound();

  const boundUpdate = updateTrailerAction.bind(null, trailer.id);
  const boundDelete = deleteTrailerAction.bind(null, trailer.id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title={`Remorque ${trailer.plateNumber}`}
        action={<DeleteButton action={boundDelete} confirmMessage="Supprimer cette remorque ?" />}
      />
      <TrailerForm
        action={boundUpdate}
        defaults={{
          plateNumber: trailer.plateNumber,
          type: trailer.type,
          capacityTons: trailer.capacityTons,
          status: trailer.status,
          nextInspectionDate: toDateInputValue(trailer.nextInspectionDate),
          insuranceExpiry: toDateInputValue(trailer.insuranceExpiry),
          notes: trailer.notes,
        }}
      />
    </div>
  );
}
