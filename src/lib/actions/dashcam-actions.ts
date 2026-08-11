"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function markDashcamDownloadedAction(videoId: string) {
  const session = await requireSession();
  const video = await prisma.dashcamVideo.updateMany({
    where: { id: videoId, companyId: session.companyId },
    data: { downloaded: true, downloadedAt: new Date() },
  });
  if (video.count > 0) {
    revalidatePath("/trips");
  }
}
