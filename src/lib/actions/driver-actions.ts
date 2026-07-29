"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { driverSchema } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth-actions";

function parseDriverForm(formData: FormData) {
  return driverSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    licenseNumber: formData.get("licenseNumber"),
    licenseExpiry: formData.get("licenseExpiry"),
    status: formData.get("status") || "ACTIVE",
    hireDate: formData.get("hireDate") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

export async function createDriverAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  const parsed = parseDriverForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  await prisma.driver.create({
    data: {
      companyId: session.companyId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      licenseExpiry: new Date(data.licenseExpiry),
      status: data.status,
      hireDate: data.hireDate ? new Date(data.hireDate) : null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/drivers");
  redirect("/drivers");
}

export async function updateDriverAction(
  driverId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();
  const parsed = parseDriverForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  await prisma.driver.updateMany({
    where: { id: driverId, companyId: session.companyId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      licenseExpiry: new Date(data.licenseExpiry),
      status: data.status,
      hireDate: data.hireDate ? new Date(data.hireDate) : null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/drivers");
  redirect("/drivers");
}

export async function deleteDriverAction(driverId: string) {
  const session = await requireSession();
  await prisma.driver.deleteMany({ where: { id: driverId, companyId: session.companyId } });
  revalidatePath("/drivers");
}
