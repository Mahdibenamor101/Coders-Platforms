"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const driverIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type DriverMarker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  recordedAt: string;
  status: string;
};

export type RouteLine = {
  id: string;
  driverName: string;
  coordinates: [number, number][];
  distanceKm: number | null;
  estimatedDurationMin: number | null;
};

const ROUTE_COLORS = ["#059669", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

export function FleetMap({
  drivers,
  routes,
  center,
}: {
  drivers: DriverMarker[];
  routes: RouteLine[];
  center: [number, number];
}) {
  return (
    <MapContainer center={center} zoom={7} className="h-full w-full" scrollWheelZoom>
      <FitBounds drivers={drivers} routes={routes} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routes.map((route, idx) => (
        <Polyline
          key={route.id}
          positions={route.coordinates}
          pathOptions={{ color: ROUTE_COLORS[idx % ROUTE_COLORS.length], weight: 4, opacity: 0.7 }}
        />
      ))}
      {drivers.map((driver) => (
        <Marker key={driver.id} position={[driver.lat, driver.lng]} icon={driverIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{driver.name}</p>
              <p className="text-slate-500">Statut : {driver.status}</p>
              <p className="text-slate-500">Position relevee : {new Date(driver.recordedAt).toLocaleString("fr-FR")}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function FitBounds({ drivers, routes }: { drivers: DriverMarker[]; routes: RouteLine[] }) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [
      ...drivers.map((d) => [d.lat, d.lng] as [number, number]),
      ...routes.flatMap((r) => r.coordinates),
    ];
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 12 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drivers.length, routes.length]);

  return null;
}
