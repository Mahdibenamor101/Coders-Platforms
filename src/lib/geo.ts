export type LatLng = { lat: number; lng: number };

export type RouteResult = {
  distanceKm: number;
  durationMin: number;
  /** GeoJSON LineString coordinates ([lng, lat][]) as JSON string, or null if unavailable. */
  geometry: string | null;
  source: "osrm" | "estimate";
};

const EARTH_RADIUS_KM = 6371;
/** Straight-line distances underestimate real road distance; this factor approximates road detour. */
const ROAD_DETOUR_FACTOR = 1.3;
const ASSUMED_AVERAGE_SPEED_KMH = 55;
const NOMINATIM_USER_AGENT = "LogisticsMahdi-SaaS/1.0 (fleet management demo)";

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function estimateRoute(points: LatLng[]): RouteResult {
  let distanceKm = 0;
  for (let i = 0; i < points.length - 1; i++) {
    distanceKm += haversineKm(points[i], points[i + 1]) * ROAD_DETOUR_FACTOR;
  }
  const durationMin = (distanceKm / ASSUMED_AVERAGE_SPEED_KMH) * 60;
  return { distanceKm, durationMin, geometry: null, source: "estimate" };
}

/**
 * Geocodes a free-text address to coordinates using the public OSM Nominatim API.
 * Returns null if the address can't be resolved or the service is unreachable
 * (no API key configured, no paid mapping provider) so callers can fall back to
 * asking the user for manual coordinates.
 */
export async function geocodeAddress(address: string): Promise<LatLng | null> {
  if (!address.trim()) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      address
    )}`;
    const response = await fetch(url, {
      headers: { "User-Agent": NOMINATIM_USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const results = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!results.length) return null;
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}

/**
 * Computes a driving route across an ordered list of waypoints using the public
 * OSRM demo server (no API key, free OpenStreetMap-based routing). Falls back to
 * a haversine-based estimate (with a road-detour multiplier) if OSRM is
 * unreachable, so route planning always returns a usable result.
 */
export async function computeRoute(points: LatLng[]): Promise<RouteResult> {
  if (points.length < 2) {
    return { distanceKm: 0, durationMin: 0, geometry: null, source: "estimate" };
  }

  try {
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return estimateRoute(points);

    const data = await response.json();
    const route = data?.routes?.[0];
    if (!route) return estimateRoute(points);

    return {
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
      geometry: JSON.stringify(route.geometry.coordinates),
      source: "osrm",
    };
  } catch {
    return estimateRoute(points);
  }
}
