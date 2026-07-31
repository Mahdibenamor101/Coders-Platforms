"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { SearchableTable } from "@/components/searchable-table";
import { formatDate } from "@/lib/format";

type TractorRow = {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number | null;
  mileage: number;
  nextMaintenanceMileage: number | null;
  technicalControlExpiry: Date | null;
  status: string;
};

export function TractorsTable({ tractors }: { tractors: TractorRow[] }) {
  return (
    <SearchableTable
      items={tractors}
      searchPlaceholder="Rechercher par immatriculation, marque, modele..."
      filterFn={(t, q) =>
        t.plateNumber.toLowerCase().includes(q) ||
        t.brand.toLowerCase().includes(q) ||
        t.model.toLowerCase().includes(q)
      }
    >
      {(filtered) => (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Immatriculation</th>
                <th className="px-4 py-3">Marque / Modele</th>
                <th className="px-4 py-3">Kilometrage</th>
                <th className="px-4 py-3">Prochain entretien</th>
                <th className="px-4 py-3">Controle technique</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.plateNumber}</td>
                  <td className="px-4 py-3">
                    {t.brand} {t.model}
                    {t.year ? ` (${t.year})` : ""}
                  </td>
                  <td className="px-4 py-3">{t.mileage.toLocaleString("fr-FR")} km</td>
                  <td className="px-4 py-3">
                    {t.nextMaintenanceMileage
                      ? `${t.nextMaintenanceMileage.toLocaleString("fr-FR")} km`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{formatDate(t.technicalControlExpiry)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/tractors/${t.id}`} className="font-medium text-emerald-700 hover:underline">
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
