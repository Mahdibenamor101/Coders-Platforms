import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const companyId = session.companyId;

  const [company, driversWithPositions, activeTrips, tractorsWithPositions, trailersWithPositions] =
    await Promise.all([
      prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
      prisma.driver.findMany({
        where: { companyId },
        include: { driverPositions: { orderBy: { recordedAt: "desc" }, take: 1 } },
      }),
      prisma.trip.findMany({
        where: { companyId, status: { in: ["PLANNED", "IN_PROGRESS"] } },
        include: { driver: true },
      }),
      prisma.tractor.findMany({
        where: { companyId },
        include: { vehiclePositions: { orderBy: { recordedAt: "desc" }, take: 1 } },
      }),
      prisma.trailer.findMany({
        where: { companyId },
        include: { vehiclePositions: { orderBy: { recordedAt: "desc" }, take: 1 } },
      }),
    ]);

  const tripStatusByDriverId = new Map(activeTrips.map((t) => [t.driverId, t.status]));

  const drivers = driversWithPositions
    .filter((d) => d.driverPositions.length > 0)
    .map((d) => {
      const pos = d.driverPositions[0];
      return {
        id: d.id,
        name: `${d.firstName} ${d.lastName}`,
        lat: pos.lat,
        lng: pos.lng,
        recordedAt: pos.recordedAt.toISOString(),
        status: tripStatusByDriverId.get(d.id) ?? d.status,
      };
    });

  const vehicles = [
    ...tractorsWithPositions
      .filter((t) => t.vehiclePositions.length > 0)
      .map((t) => {
        const pos = t.vehiclePositions[0];
        return {
          id: t.id,
          label: `${t.brand} ${t.model} (${t.plateNumber})`,
          kind: "tractor" as const,
          lat: pos.lat,
          lng: pos.lng,
          recordedAt: pos.recordedAt.toISOString(),
        };
      }),
    ...trailersWithPositions
      .filter((t) => t.vehiclePositions.length > 0)
      .map((t) => {
        const pos = t.vehiclePositions[0];
        return {
          id: t.id,
          label: `Remorque ${t.plateNumber}`,
          kind: "trailer" as const,
          lat: pos.lat,
          lng: pos.lng,
          recordedAt: pos.recordedAt.toISOString(),
        };
      }),
  ];

  const routes = activeTrips
    .filter((t) => t.routeGeometry)
    .map((t) => {
      const coords = JSON.parse(t.routeGeometry as string) as [number, number][];
      return {
        id: t.id,
        driverName: `${t.driver.firstName} ${t.driver.lastName}`,
        coordinates: coords.map(([lng, lat]) => [lat, lng] as [number, number]),
        distanceKm: t.distanceKm,
        estimatedDurationMin: t.estimatedDurationMin,
      };
    });

  const center: [number, number] =
    company.depotLat != null && company.depotLng != null
      ? [company.depotLat, company.depotLng]
      : drivers[0]
        ? [drivers[0].lat, drivers[0].lng]
        : (routes[0]?.coordinates[0] ?? [31.7917, -7.0926]);

  return NextResponse.json({ drivers, vehicles, routes, center });
}
