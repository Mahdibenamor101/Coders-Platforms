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

// Vehicle GPS-hardware positions are visually distinct from driver-phone
// positions: a colored dot instead of the default pin, since they come from
// an independent source (a physical tracker, not the driver's phone).
function vehicleIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}

const TRACTOR_ICON = vehicleIcon("#d97706");
const TRAILER_ICON = vehicleIcon("#7c3aed");

export type DriverMarker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  recordedAt: string;
  status: string;
};

export type VehicleMarker = {
  id: string;
  label: string;
  kind: "tractor" | "trailer";
  lat: number;
  lng: number;
  recordedAt: string;
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
  vehicles = [],
  routes,
  center,
}: {
  drivers: DriverMarker[];
  vehicles?: VehicleMarker[];
  routes: RouteLine[];
  center: [number, number];
}) {
  return (
    <MapContainer center={center} zoom={7} className="h-full w-full" scrollWheelZoom>
      <FitBounds drivers={drivers} vehicles={vehicles} routes={routes} />
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
      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.id}
          position={[vehicle.lat, vehicle.lng]}
          icon={vehicle.kind === "tractor" ? TRACTOR_ICON : TRAILER_ICON}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{vehicle.label}</p>
              <p className="text-slate-500">Boitier GPS ({vehicle.kind === "tractor" ? "tracteur" : "remorque"})</p>
              <p className="text-slate-500">Position relevee : {new Date(vehicle.recordedAt).toLocaleString("fr-FR")}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function FitBounds({
  drivers,
  vehicles,
  routes,
}: {
  drivers: DriverMarker[];
  vehicles: VehicleMarker[];
  routes: RouteLine[];
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [
      ...drivers.map((d) => [d.lat, d.lng] as [number, number]),
      ...vehicles.map((v) => [v.lat, v.lng] as [number, number]),
      ...routes.flatMap((r) => r.coordinates),
    ];
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 12 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drivers.length, vehicles.length, routes.length]);

  return null;
}
