"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { maintenanceSchema } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth-actions";

export async function createMaintenanceAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();
  const parsed = maintenanceSchema.safeParse({
    tractorId: formData.get("tractorId") ?? "",
    trailerId: formData.get("trailerId") ?? "",
    type: formData.get("type") || "OTHER",
    performedAt: formData.get("performedAt"),
    mileage: formData.get("mileage") || undefined,
    cost: formData.get("cost") || undefined,
    notes: formData.get("notes") ?? "",
    nextDueAt: formData.get("nextDueAt") ?? "",
    nextDueMileage: formData.get("nextDueMileage") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  if (data.tractorId) {
    const tractor = await prisma.tractor.findFirst({
      where: { id: data.tractorId, companyId: session.companyId },
    });
    if (!tractor) return { error: "Tracteur introuvable." };
  }
  if (data.trailerId) {
    const trailer = await prisma.trailer.findFirst({
      where: { id: data.trailerId, companyId: session.companyId },
    });
    if (!trailer) return { error: "Remorque introuvable." };
  }

  await prisma.maintenanceRecord.create({
    data: {
      companyId: session.companyId,
      tractorId: data.tractorId || null,
      trailerId: data.trailerId || null,
      type: data.type,
      performedAt: new Date(data.performedAt),
      mileage: data.mileage ?? null,
      cost: data.cost ?? null,
      notes: data.notes || null,
      nextDueAt: data.nextDueAt ? new Date(data.nextDueAt) : null,
      nextDueMileage: data.nextDueMileage ?? null,
    },
  });

  if (data.tractorId) {
    await prisma.tractor.updateMany({
      where: { id: data.tractorId, companyId: session.companyId },
      data: {
        lastMaintenanceDate: new Date(data.performedAt),
        ...(data.mileage != null ? { lastMaintenanceMileage: data.mileage, mileage: data.mileage } : {}),
        ...(data.nextDueMileage != null ? { nextMaintenanceMileage: data.nextDueMileage } : {}),
      },
    });
  }
  if (data.trailerId) {
    await prisma.trailer.updateMany({
      where: { id: data.trailerId, companyId: session.companyId },
      data: {
        lastInspectionDate: new Date(data.performedAt),
        ...(data.nextDueAt ? { nextInspectionDate: new Date(data.nextDueAt) } : {}),
      },
    });
  }

  revalidatePath("/maintenance");
  revalidatePath("/tractors");
  revalidatePath("/trailers");
  redirect("/maintenance");
}

export async function deleteMaintenanceAction(recordId: string) {
  const session = await requireSession();
  await prisma.maintenanceRecord.deleteMany({
    where: { id: recordId, companyId: session.companyId },
  });
  revalidatePath("/maintenance");
}
