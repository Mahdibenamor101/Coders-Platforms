import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { token, lat, lng } = body ?? {};

  if (!token || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Parametres invalides" }, { status: 400 });
  }

  const driver = await prisma.driver.findUnique({ where: { accessToken: token } });
  if (!driver) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  const activeTrip = await prisma.trip.findFirst({
    where: { driverId: driver.id, status: "IN_PROGRESS" },
  });

  await prisma.driverPosition.create({
    data: {
      companyId: driver.companyId,
      driverId: driver.id,
      tripId: activeTrip?.id ?? null,
      lat,
      lng,
    },
  });

  return NextResponse.json({ ok: true });
}
