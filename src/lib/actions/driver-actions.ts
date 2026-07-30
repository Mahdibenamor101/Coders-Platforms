"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { driverSchema } from "@/lib/validation";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
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
    skills: formData.get("skills") ?? "",
    costPerKm: formData.get("costPerKm") || undefined,
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
      skills: data.skills || null,
      costPerKm: data.costPerKm ?? null,
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
      skills: data.skills || null,
      costPerKm: data.costPerKm ?? null,
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

export async function sendDriverPortalLinkAction(driverId: string) {
  const session = await requireSession();
  const driver = await prisma.driver.findFirst({
    where: { id: driverId, companyId: session.companyId },
  });
  if (!driver) return;

  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const link = `${baseUrl}/driver/${driver.accessToken}`;

  await sendWhatsAppMessage({
    companyId: session.companyId,
    toPhone: driver.phone,
    body: `Bonjour ${driver.firstName}, voici votre lien personnel FleetLink pour suivre vos missions du jour : ${link}`,
    type: "CUSTOM",
    driverId: driver.id,
  });

  revalidatePath(`/drivers/${driverId}`);
}
