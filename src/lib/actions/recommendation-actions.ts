"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { generateRecommendationsForCompany } from "@/lib/recommendations";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function generateRecommendationsAction() {
  const session = await requireSession();
  await generateRecommendationsForCompany(session.companyId);
  revalidatePath("/recommendations");
  revalidatePath("/dashboard");
}

export async function resolveRecommendationAction(recommendationId: string) {
  const session = await requireSession();
  await prisma.recommendation.updateMany({
    where: { id: recommendationId, companyId: session.companyId },
    data: { resolved: true, resolvedAt: new Date() },
  });
  revalidatePath("/recommendations");
  revalidatePath("/dashboard");
}

/**
 * Sends the recommendation's message to the relevant driver via WhatsApp,
 * when the recommendation is tied to a driver or a trip (which has a driver).
 */
export async function sendRecommendationWhatsAppAction(recommendationId: string) {
  const session = await requireSession();
  const recommendation = await prisma.recommendation.findFirst({
    where: { id: recommendationId, companyId: session.companyId },
  });
  if (!recommendation) return;

  let driver: { id: string; phone: string } | null = null;

  if (recommendation.entityType === "DRIVER") {
    driver = await prisma.driver.findFirst({
      where: { id: recommendation.entityId, companyId: session.companyId },
      select: { id: true, phone: true },
    });
  } else if (recommendation.entityType === "TRIP") {
    const trip = await prisma.trip.findFirst({
      where: { id: recommendation.entityId, companyId: session.companyId },
      select: { driver: { select: { id: true, phone: true } } },
    });
    driver = trip?.driver ?? null;
  }

  if (!driver) return;

  await sendWhatsAppMessage({
    companyId: session.companyId,
    toPhone: driver.phone,
    body: `${recommendation.title}\n\n${recommendation.message}`,
    type: "RECOMMENDATION",
    driverId: driver.id,
  });

  revalidatePath("/recommendations");
}
