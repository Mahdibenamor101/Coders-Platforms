"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { settingsSchema } from "@/lib/validation";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { geocodeAddress } from "@/lib/geo";
import type { FormState } from "@/lib/actions/auth-actions";

export async function updateSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  const parsed = settingsSchema.safeParse({
    companyName: formData.get("companyName"),
    whatsappPhoneNumberId: formData.get("whatsappPhoneNumberId") ?? "",
    whatsappAccessToken: formData.get("whatsappAccessToken") ?? "",
    whatsappTestRecipient: formData.get("whatsappTestRecipient") ?? "",
    depotAddress: formData.get("depotAddress") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  const current = await prisma.company.findUniqueOrThrow({ where: { id: session.companyId } });
  let depotLat = current.depotLat;
  let depotLng = current.depotLng;

  if (data.depotAddress && data.depotAddress !== current.depotAddress) {
    const geocoded = await geocodeAddress(data.depotAddress);
    depotLat = geocoded?.lat ?? null;
    depotLng = geocoded?.lng ?? null;
  } else if (!data.depotAddress) {
    depotLat = null;
    depotLng = null;
  }

  await prisma.company.update({
    where: { id: session.companyId },
    data: {
      name: data.companyName,
      whatsappPhoneNumberId: data.whatsappPhoneNumberId || null,
      whatsappAccessToken: data.whatsappAccessToken || null,
      whatsappTestRecipient: data.whatsappTestRecipient || null,
      depotAddress: data.depotAddress || null,
      depotLat,
      depotLng,
    },
  });

  revalidatePath("/settings");
  return { error: undefined };
}

export async function sendTestWhatsAppAction() {
  const session = await requireSession();
  const company = await prisma.company.findUniqueOrThrow({ where: { id: session.companyId } });
  const recipient = company.whatsappTestRecipient;
  if (!recipient) return;

  await sendWhatsAppMessage({
    companyId: session.companyId,
    toPhone: recipient,
    body: `Message de test LOGISTICS@MAHDI pour ${company.name}. La configuration WhatsApp fonctionne.`,
    type: "CUSTOM",
  });

  revalidatePath("/settings");
}
