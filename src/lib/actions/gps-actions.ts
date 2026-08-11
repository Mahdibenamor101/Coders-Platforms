"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function regenerateTractorGpsTokenAction(tractorId: string) {
  const session = await requireSession();
  await prisma.tractor.updateMany({
    where: { id: tractorId, companyId: session.companyId },
    data: { gpsDeviceToken: randomUUID() },
  });
  revalidatePath(`/tractors/${tractorId}`);
}

export async function regenerateTrailerGpsTokenAction(trailerId: string) {
  const session = await requireSession();
  await prisma.trailer.updateMany({
    where: { id: trailerId, companyId: session.companyId },
    data: { gpsDeviceToken: randomUUID() },
  });
  revalidatePath(`/trailers/${trailerId}`);
}
