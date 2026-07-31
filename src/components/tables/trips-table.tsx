"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { SearchableTable } from "@/components/searchable-table";
import { formatDateTime } from "@/lib/format";

type TripRow = {
  id: string;
  origin: string;
  destination: string;
  departureAt: Date;
  driverNotifiedAt: Date | null;
  status: string;
  driver: { firstName: string; lastName: string };
  tractor: { plateNumber: string };
  trailer: { plateNumber: string } | null;
};

export function TripsTable({ trips }: { trips: TripRow[] }) {
  return (
    <SearchableTable
      items={trips}
      searchPlaceholder="Rechercher par trajet, chauffeur, vehicule..."
      filterFn={(t, q) =>
        t.origin.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        `${t.driver.firstName} ${t.driver.lastName}`.toLowerCase().includes(q) ||
        t.tractor.plateNumber.toLowerCase().includes(q) ||
        (t.trailer?.plateNumber.toLowerCase().includes(q) ?? false)
      }
    >
      {(filtered) => (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Trajet</th>
                <th className="px-4 py-3">Chauffeur</th>
                <th className="px-4 py-3">Tracteur / Remorque</th>
                <th className="px-4 py-3">Depart</th>
                <th className="px-4 py-3">Notifie</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {trip.origin} → {trip.destination}
                  </td>
                  <td className="px-4 py-3">
                    {trip.driver.firstName} {trip.driver.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {trip.tractor.plateNumber}
                    {trip.trailer ? ` / ${trip.trailer.plateNumber}` : ""}
                  </td>
                  <td className="px-4 py-3">{formatDateTime(trip.departureAt)}</td>
                  <td className="px-4 py-3">{trip.driverNotifiedAt ? "✅" : "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={trip.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/trips/${trip.id}`} className="font-medium text-emerald-700 hover:underline">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SearchableTable>
  );
}
