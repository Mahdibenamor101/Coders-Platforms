import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook for physical GPS tracker devices installed in a tractor or
 * trailer (Teltonika, Geotab, etc.), authenticated via the vehicle's
 * gpsDeviceToken (see the "Position GPS" section on the vehicle's detail
 * page). Independent of DriverPosition, which comes from the driver's phone.
 *
 * POST /api/gps/<token>/position
 * body: { lat: number, lng: number, speedKmh?: number, heading?: number }
 */
export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const body = await request.json().catch(() => null);
  const lat = body?.lat;
  const lng = body?.lng;
  const speedKmh = typeof body?.speedKmh === "number" ? body.speedKmh : null;
  const heading = typeof body?.heading === "number" ? body.heading : null;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Parametres invalides (lat, lng requis)" }, { status: 400 });
  }

  const tractor = await prisma.tractor.findUnique({ where: { gpsDeviceToken: params.token } });
  if (tractor) {
    await prisma.vehiclePosition.create({
      data: { companyId: tractor.companyId, tractorId: tractor.id, lat, lng, speedKmh, heading },
    });
    return NextResponse.json({ ok: true, vehicle: "tractor", id: tractor.id });
  }

  const trailer = await prisma.trailer.findUnique({ where: { gpsDeviceToken: params.token } });
  if (trailer) {
    await prisma.vehiclePosition.create({
      data: { companyId: trailer.companyId, trailerId: trailer.id, lat, lng, speedKmh, heading },
    });
    return NextResponse.json({ ok: true, vehicle: "trailer", id: trailer.id });
  }

  return NextResponse.json({ error: "Token invalide" }, { status: 404 });
}
