"use client";

import dynamic from "next/dynamic";
import type { DriverMarker, RouteLine } from "./fleet-map";

const FleetMap = dynamic(() => import("./fleet-map").then((m) => m.FleetMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      Chargement de la carte...
    </div>
  ),
});

export function FleetMapClient(props: {
  drivers: DriverMarker[];
  routes: RouteLine[];
  center: [number, number];
}) {
  return <FleetMap {...props} />;
}
