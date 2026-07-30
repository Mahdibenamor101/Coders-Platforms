import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { FleetMapClient } from "@/components/fleet-map-client";
import type { DriverMarker, RouteLine } from "@/components/fleet-map";

const FALLBACK_CENTER: [number, number] = [31.7917, -7.0926];

export default async function LivePage() {
  const session = await requireSession();

  const [company, driversWithPositions, activeTrips] = await Promise.all([
    prisma.company.findUniqueOrThrow({ where: { id: session.companyId } }),
    prisma.driver.findMany({
      where: { companyId: session.companyId },
      include: { driverPositions: { orderBy: { recordedAt: "desc" }, take: 1 } },
    }),
    prisma.trip.findMany({
      where: { companyId: session.companyId, status: { in: ["PLANNED", "IN_PROGRESS"] } },
      include: { driver: true },
    }),
  ]);

  const tripStatusByDriverId = new Map(activeTrips.map((t) => [t.driverId, t.status]));

  const drivers: DriverMarker[] = driversWithPositions
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

  const routes: RouteLine[] = activeTrips
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
        : routes[0]?.coordinates[0] ?? FALLBACK_CENTER;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Carte live"
        description="Position des chauffeurs et tracees de tournee en temps reel (OpenStreetMap)."
      />
      <div className="card mb-4 flex flex-wrap gap-6 p-4 text-sm">
        <div>
          <span className="font-semibold text-slate-800">{drivers.length}</span> chauffeur(s) localise(s)
        </div>
        <div>
          <span className="font-semibold text-slate-800">{routes.length}</span> tournee(s) active(s) affichee(s)
        </div>
      </div>
      <div className="card h-[600px] overflow-hidden p-0">
        <FleetMapClient drivers={drivers} routes={routes} center={center} />
      </div>
      {activeTrips.length > 0 && (
        <div className="card mt-4 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">ETA des tournees actives</h2>
          <ul className="space-y-2 text-sm">
            {activeTrips.map((t) => (
              <li key={t.id} className="flex items-center justify-between">
                <span>{t.driver.firstName} {t.driver.lastName} - {t.origin} → {t.destination}</span>
                <span className="text-slate-500">
                  {t.distanceKm ? `${t.distanceKm.toFixed(0)} km` : "distance inconnue"}
                  {t.estimatedDurationMin ? ` · ~${Math.round(t.estimatedDurationMin / 60)}h${String(Math.round(t.estimatedDurationMin % 60)).padStart(2, "0")}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
