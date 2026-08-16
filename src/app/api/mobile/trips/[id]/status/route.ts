import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import type { TripStatus } from "@/lib/enums";

const VALID_STATUSES: TripStatus[] = ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (typeof status !== "string" || !VALID_STATUSES.includes(status as TripStatus)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const trip = await prisma.trip.findFirst({ where: { id: params.id, companyId: session.companyId } });
  if (!trip) return NextResponse.json({ error: "Tournee introuvable" }, { status: 404 });

  await prisma.trip.updateMany({
    where: { id: params.id, companyId: session.companyId },
    data: {
      status: status as TripStatus,
      actualArrivalAt: status === "COMPLETED" ? new Date() : trip.actualArrivalAt,
    },
  });

  if (status === "COMPLETED" || status === "CANCELLED") {
    await prisma.tractor.updateMany({
      where: { id: trip.tractorId, companyId: session.companyId },
      data: { status: "AVAILABLE" },
    });
    if (trip.trailerId) {
      await prisma.trailer.updateMany({
        where: { id: trip.trailerId, companyId: session.companyId },
        data: { status: "AVAILABLE" },
      });
    }
  }

  const updated = await prisma.trip.findUnique({ where: { id: params.id } });
  return NextResponse.json({ trip: updated });
}
