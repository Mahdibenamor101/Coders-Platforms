"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { SearchableTable } from "@/components/searchable-table";
import { formatDate } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  CURTAIN: "Tautliner / Bache",
  REEFER: "Frigorifique",
  FLATBED: "Plateau",
  TANK: "Citerne",
  CONTAINER: "Porte-conteneur",
  TIPPER: "Benne",
};

type TrailerRow = {
  id: string;
  plateNumber: string;
  type: string;
  capacityTons: number | null;
  nextInspectionDate: Date | null;
  status: string;
};

export function TrailersTable({ trailers }: { trailers: TrailerRow[] }) {
  return (
    <SearchableTable
      items={trailers}
      searchPlaceholder="Rechercher par immatriculation, type..."
      filterFn={(t, q) =>
        t.plateNumber.toLowerCase().includes(q) || (TYPE_LABELS[t.type] ?? t.type).toLowerCase().includes(q)
      }
    >
      {(filtered) => (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Immatriculation</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Capacite</th>
                <th className="px-4 py-3">Prochaine inspection</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.plateNumber}</td>
                  <td className="px-4 py-3">{TYPE_LABELS[t.type] ?? t.type}</td>
                  <td className="px-4 py-3">{t.capacityTons ? `${t.capacityTons} t` : "-"}</td>
                  <td className="px-4 py-3">{formatDate(t.nextInspectionDate)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/trailers/${t.id}`} className="font-medium text-emerald-700 hover:underline">
                      Modifier
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
