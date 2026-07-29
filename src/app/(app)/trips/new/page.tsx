import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { TripForm } from "@/components/forms/trip-form";
import { createTripAction } from "@/lib/actions/trip-actions";

export default async function NewTripPage() {
  const session = await requireSession();
  const [tractors, trailers, drivers] = await Promise.all([
    prisma.tractor.findMany({ where: { companyId: session.companyId }, orderBy: { plateNumber: "asc" } }),
    prisma.trailer.findMany({ where: { companyId: session.companyId }, orderBy: { plateNumber: "asc" } }),
    prisma.driver.findMany({ where: { companyId: session.companyId, status: "ACTIVE" }, orderBy: { firstName: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nouvelle mission" description="Assignez un tracteur, une remorque et un chauffeur." />
      <TripForm
        action={createTripAction}
        tractors={tractors.map((t) => ({ id: t.id, label: `${t.plateNumber} - ${t.brand} ${t.model}` }))}
        trailers={trailers.map((t) => ({ id: t.id, label: `${t.plateNumber}` }))}
        drivers={drivers.map((d) => ({ id: d.id, label: `${d.firstName} ${d.lastName}` }))}
      />
    </div>
  );
}
