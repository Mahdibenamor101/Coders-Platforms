"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { SearchableTable } from "@/components/searchable-table";
import { formatDate } from "@/lib/format";

type DriverRow = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: Date;
  status: string;
};

export function DriversTable({ drivers }: { drivers: DriverRow[] }) {
  return (
    <SearchableTable
      items={drivers}
      searchPlaceholder="Rechercher par nom, telephone, permis..."
      filterFn={(d, q) =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q)
      }
    >
      {(filtered) => (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Telephone</th>
                <th className="px-4 py-3">Permis</th>
                <th className="px-4 py-3">Expiration permis</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {d.firstName} {d.lastName}
                  </td>
                  <td className="px-4 py-3">{d.phone}</td>
                  <td className="px-4 py-3">{d.licenseNumber}</td>
                  <td className="px-4 py-3">{formatDate(d.licenseExpiry)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/drivers/${d.id}`} className="font-medium text-emerald-700 hover:underline">
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
