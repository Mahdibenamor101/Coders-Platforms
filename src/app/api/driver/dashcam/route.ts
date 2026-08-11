import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

/**
 * Dashcam video segment upload from the driver portal (see
 * src/components/dashcam-recorder.tsx). The driver's phone camera records in
 * short segments while the trip is in progress; each segment is uploaded
 * here as it finishes. Segments are deleted after 3 days unless a dispatcher
 * downloads them (see /api/cron/dashcam-cleanup).
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = formData.get("token");
  const tripId = formData.get("tripId");
  const segmentIndex = Number(formData.get("segmentIndex") ?? 0);
  const video = formData.get("video");

  if (typeof token !== "string" || typeof tripId !== "string" || !(video instanceof File)) {
    return NextResponse.json({ error: "Parametres invalides" }, { status: 400 });
  }

  const driver = await prisma.driver.findUnique({ where: { accessToken: token } });
  if (!driver) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  const trip = await prisma.trip.findFirst({ where: { id: tripId, driverId: driver.id } });
  if (!trip) {
    return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
  }

  const extension = (video.type.split("/")[1] || "webm").split(";")[0].replace(/[^a-z0-9]/gi, "");
  const filename = `${tripId}-${Date.now()}-${segmentIndex}.${extension}`;

  let videoUrl: string;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`dashcam/${filename}`, video, { access: "public" });
    videoUrl = blob.url;
  } else {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "dashcam");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await video.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);
    videoUrl = `/uploads/dashcam/${filename}`;
  }

  await prisma.dashcamVideo.create({
    data: {
      companyId: driver.companyId,
      tripId: trip.id,
      driverId: driver.id,
      videoUrl,
      segmentIndex,
    },
  });

  return NextResponse.json({ ok: true });
}
