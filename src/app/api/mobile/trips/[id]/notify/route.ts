import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { buildTripAssignmentMessage, sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const trip = await prisma.trip.findFirst({
    where: { id: params.id, companyId: session.companyId },
    include: { driver: true, tractor: true, trailer: true },
  });
  if (!trip) return NextResponse.json({ error: "Tournee introuvable" }, { status: 404 });

  const message = buildTripAssignmentMessage({
    driverFirstName: trip.driver.firstName,
    origin: trip.origin,
    destination: trip.destination,
    departureAt: trip.departureAt,
    tractorPlate: trip.tractor.plateNumber,
    trailerPlate: trip.trailer?.plateNumber,
    cargoDescription: trip.cargoDescription,
  });

  await sendWhatsAppMessage({
    companyId: session.companyId,
    toPhone: trip.driver.phone,
    body: message,
    type: "TRIP_ASSIGNMENT",
    driverId: trip.driver.id,
  });

  await prisma.trip.update({ where: { id: trip.id }, data: { driverNotifiedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
