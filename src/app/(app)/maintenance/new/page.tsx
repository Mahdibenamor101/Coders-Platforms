import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { MaintenanceForm } from "@/components/forms/maintenance-form";
import { createMaintenanceAction } from "@/lib/actions/maintenance-actions";

export default async function NewMaintenancePage() {
  const session = await requireSession();
  const [tractors, trailers] = await Promise.all([
    prisma.tractor.findMany({ where: { companyId: session.companyId }, orderBy: { plateNumber: "asc" } }),
    prisma.trailer.findMany({ where: { companyId: session.companyId }, orderBy: { plateNumber: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nouvel entretien" />
      <MaintenanceForm
        action={createMaintenanceAction}
        tractors={tractors.map((t) => ({ id: t.id, label: `${t.plateNumber} - ${t.brand} ${t.model}` }))}
        trailers={trailers.map((t) => ({ id: t.id, label: t.plateNumber }))}
      />
    </div>
  );
}
