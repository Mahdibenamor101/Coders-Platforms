import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { tripSchema } from "@/lib/validation";
import { buildTripAssignmentMessage, sendWhatsAppMessage } from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const trips = await prisma.trip.findMany({
    where: { companyId: session.companyId },
    orderBy: { departureAt: "desc" },
    include: {
      tractor: { select: { plateNumber: true } },
      trailer: { select: { plateNumber: true } },
      driver: { select: { firstName: true, lastName: true } },
      orders: { select: { id: true } },
    },
  });
  return NextResponse.json({ trips });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = tripSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const data = parsed.data;
  const notifyDriver = Boolean(body?.notifyDriver);

  const [tractor, trailer, driver] = await Promise.all([
    prisma.tractor.findFirst({ where: { id: data.tractorId, companyId: session.companyId } }),
    data.trailerId
      ? prisma.trailer.findFirst({ where: { id: data.trailerId, companyId: session.companyId } })
      : Promise.resolve(null),
    prisma.driver.findFirst({ where: { id: data.driverId, companyId: session.companyId } }),
  ]);

  if (!tractor || !driver) {
    return NextResponse.json({ error: "Tracteur ou chauffeur introuvable." }, { status: 400 });
  }

  const trip = await prisma.trip.create({
    data: {
      companyId: session.companyId,
      tractorId: tractor.id,
      trailerId: trailer?.id ?? null,
      driverId: driver.id,
      origin: data.origin,
      destination: data.destination,
      departureAt: new Date(data.departureAt),
      estimatedArrivalAt: data.estimatedArrivalAt ? new Date(data.estimatedArrivalAt) : null,
      cargoDescription: data.cargoDescription || null,
      distanceKm: data.distanceKm ?? null,
    },
  });

  await prisma.tractor.updateMany({ where: { id: tractor.id, companyId: session.companyId }, data: { status: "IN_USE" } });
  if (trailer) {
    await prisma.trailer.updateMany({ where: { id: trailer.id, companyId: session.companyId }, data: { status: "IN_USE" } });
  }

  if (notifyDriver) {
    const message = buildTripAssignmentMessage({
      driverFirstName: driver.firstName,
      origin: data.origin,
      destination: data.destination,
      departureAt: new Date(data.departureAt),
      tractorPlate: tractor.plateNumber,
      trailerPlate: trailer?.plateNumber,
      cargoDescription: data.cargoDescription || null,
    });

    await sendWhatsAppMessage({
      companyId: session.companyId,
      toPhone: driver.phone,
      body: message,
      type: "TRIP_ASSIGNMENT",
      driverId: driver.id,
    });

    await prisma.trip.update({ where: { id: trip.id }, data: { driverNotifiedAt: new Date() } });
  }

  return NextResponse.json({ trip }, { status: 201 });
}
