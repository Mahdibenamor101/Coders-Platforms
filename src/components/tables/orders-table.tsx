"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { SearchableTable } from "@/components/searchable-table";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "PENDING", label: "En attente" },
  { value: "ASSIGNED", label: "Assignee" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "DELIVERED", label: "Livree" },
  { value: "FAILED", label: "Echec" },
  { value: "CANCELLED", label: "Annulee" },
];

type OrderRow = {
  id: string;
  reference: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  priority: string;
  status: string;
  trip: { id: string; driver: { firstName: string; lastName: string } } | null;
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const byStatus = useMemo(
    () => (statusFilter === "ALL" ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <SearchableTable
        items={byStatus}
        searchPlaceholder="Rechercher par reference, client, adresse..."
        filterFn={(o, q) =>
          o.reference.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.pickupAddress.toLowerCase().includes(q) ||
          o.deliveryAddress.toLowerCase().includes(q)
        }
      >
        {(filtered) => (
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Trajet</th>
                  <th className="px-4 py-3">Priorite</th>
                  <th className="px-4 py-3">Tournee</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{order.reference}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.pickupAddress} → {order.deliveryAddress}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.priority} />
                    </td>
                    <td className="px-4 py-3">
                      {order.trip ? (
                        <Link href={`/trips/${order.trip.id}`} className="text-emerald-700 hover:underline">
                          {order.trip.driver.firstName} {order.trip.driver.lastName}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/orders/${order.id}`} className="font-medium text-emerald-700 hover:underline">
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
    </div>
  );
}
