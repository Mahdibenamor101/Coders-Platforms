"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { tractorSchema } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth-actions";

function parseTractorForm(formData: FormData) {
  return tractorSchema.safeParse({
    plateNumber: formData.get("plateNumber"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: formData.get("year") || undefined,
    mileage: formData.get("mileage") || 0,
    status: formData.get("status") || "AVAILABLE",
    nextMaintenanceMileage: formData.get("nextMaintenanceMileage") || undefined,
    insuranceExpiry: formData.get("insuranceExpiry") ?? "",
    technicalControlExpiry: formData.get("technicalControlExpiry") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

export async function createTractorAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  const parsed = parseTractorForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  await prisma.tractor.create({
    data: {
      companyId: session.companyId,
      plateNumber: data.plateNumber,
      brand: data.brand,
      model: data.model,
      year: data.year ?? null,
      mileage: data.mileage,
      status: data.status,
      nextMaintenanceMileage: data.nextMaintenanceMileage ?? null,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
      technicalControlExpiry: data.technicalControlExpiry
        ? new Date(data.technicalControlExpiry)
        : null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/tractors");
  redirect("/tractors");
}

export async function updateTractorAction(
  tractorId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();
  const parsed = parseTractorForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  await prisma.tractor.updateMany({
    where: { id: tractorId, companyId: session.companyId },
    data: {
      plateNumber: data.plateNumber,
      brand: data.brand,
      model: data.model,
      year: data.year ?? null,
      mileage: data.mileage,
      status: data.status,
      nextMaintenanceMileage: data.nextMaintenanceMileage ?? null,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
      technicalControlExpiry: data.technicalControlExpiry
        ? new Date(data.technicalControlExpiry)
        : null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/tractors");
  redirect("/tractors");
}

export async function deleteTractorAction(tractorId: string) {
  const session = await requireSession();
  await prisma.tractor.deleteMany({ where: { id: tractorId, companyId: session.companyId } });
  revalidatePath("/tractors");
}
