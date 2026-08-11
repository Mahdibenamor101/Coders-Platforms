import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { TractorForm } from "@/components/forms/tractor-form";
import { DeleteButton } from "@/components/delete-button";
import { GpsDeviceCard } from "@/components/gps-device-card";
import { updateTractorAction, deleteTractorAction } from "@/lib/actions/tractor-actions";
import { regenerateTractorGpsTokenAction } from "@/lib/actions/gps-actions";
import { toDateInputValue, formatDate } from "@/lib/format";

export default async function EditTractorPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const tractor = await prisma.tractor.findFirst({
    where: { id: params.id, companyId: session.companyId },
  });
  if (!tractor) notFound();

  const maintenanceRecords = await prisma.maintenanceRecord.findMany({
    where: { tractorId: tractor.id, companyId: session.companyId },
    orderBy: { performedAt: "desc" },
  });

  const lastPosition = await prisma.vehiclePosition.findFirst({
    where: { tractorId: tractor.id },
    orderBy: { recordedAt: "desc" },
  });

  const boundUpdate = updateTractorAction.bind(null, tractor.id);
  const boundDelete = deleteTractorAction.bind(null, tractor.id);
  const boundRegenerateGps = regenerateTractorGpsTokenAction.bind(null, tractor.id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title={`${tractor.brand} ${tractor.model} - ${tractor.plateNumber}`}
        action={<DeleteButton action={boundDelete} confirmMessage="Supprimer ce tracteur ?" />}
      />
      <TractorForm
        action={boundUpdate}
        defaults={{
          plateNumber: tractor.plateNumber,
          brand: tractor.brand,
          model: tractor.model,
          year: tractor.year,
          mileage: tractor.mileage,
          status: tractor.status,
          nextMaintenanceMileage: tractor.nextMaintenanceMileage,
          insuranceExpiry: toDateInputValue(tractor.insuranceExpiry),
          technicalControlExpiry: toDateInputValue(tractor.technicalControlExpiry),
          notes: tractor.notes,
          costPerKm: tractor.costPerKm,
          hazmatCertified: tractor.hazmatCertified,
          fuelLevelPercent: tractor.fuelLevelPercent,
          adBlueLevelPercent: tractor.adBlueLevelPercent,
        }}
      />

      <GpsDeviceCard
        token={tractor.gpsDeviceToken}
        lastPosition={lastPosition}
        regenerateAction={boundRegenerateGps}
      />

      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Historique d&apos;entretien</h2>
        {maintenanceRecords.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun entretien enregistre.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {maintenanceRecords.map((record) => (
              <li key={record.id} className="py-3">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-800">{record.type}</span>
                  <span className="text-slate-500">{formatDate(record.performedAt)}</span>
                </div>
                {record.notes && <p className="mt-1 text-slate-500">{record.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
