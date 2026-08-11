import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RETENTION_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Cron endpoint: deletes dashcam video segments older than 3 days that a
 * dispatcher never downloaded, along with their underlying storage object,
 * so video storage doesn't grow unbounded. Protect with CRON_SECRET in
 * production (e.g. Vercel Cron "Authorization: Bearer <secret>").
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const cutoff = new Date(Date.now() - RETENTION_MS);
  const expired = await prisma.dashcamVideo.findMany({
    where: { downloaded: false, recordedAt: { lt: cutoff } },
  });

  let deletedFiles = 0;
  for (const video of expired) {
    try {
      if (video.videoUrl.startsWith("/uploads/")) {
        await unlink(path.join(process.cwd(), "public", video.videoUrl));
      } else {
        await del(video.videoUrl);
      }
      deletedFiles += 1;
    } catch {
      // Storage object already gone or unreachable - still drop the DB row below.
    }
  }

  await prisma.dashcamVideo.deleteMany({ where: { id: { in: expired.map((v) => v.id) } } });

  return NextResponse.json({ deletedRecords: expired.length, deletedFiles });
}
