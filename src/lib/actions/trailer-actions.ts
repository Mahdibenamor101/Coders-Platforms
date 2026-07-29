"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { trailerSchema } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth-actions";

function parseTrailerForm(formData: FormData) {
  return trailerSchema.safeParse({
    plateNumber: formData.get("plateNumber"),
    type: formData.get("type") || "CURTAIN",
    capacityTons: formData.get("capacityTons") || undefined,
    status: formData.get("status") || "AVAILABLE",
    nextInspectionDate: formData.get("nextInspectionDate") ?? "",
    insuranceExpiry: formData.get("insuranceExpiry") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

export async function createTrailerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  const parsed = parseTrailerForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  await prisma.trailer.create({
    data: {
      companyId: session.companyId,
      plateNumber: data.plateNumber,
      type: data.type,
      capacityTons: data.capacityTons ?? null,
      status: data.status,
      nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate) : null,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/trailers");
  redirect("/trailers");
}

export async function updateTrailerAction(
  trailerId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();
  const parsed = parseTrailerForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  await prisma.trailer.updateMany({
    where: { id: trailerId, companyId: session.companyId },
    data: {
      plateNumber: data.plateNumber,
      type: data.type,
      capacityTons: data.capacityTons ?? null,
      status: data.status,
      nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate) : null,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/trailers");
  redirect("/trailers");
}

export async function deleteTrailerAction(trailerId: string) {
  const session = await requireSession();
  await prisma.trailer.deleteMany({ where: { id: trailerId, companyId: session.companyId } });
  revalidatePath("/trailers");
}
