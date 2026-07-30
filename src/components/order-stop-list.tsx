"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { reorderTripStopsAction } from "@/lib/actions/order-actions";

export type StopItem = {
  id: string;
  reference: string;
  customerName: string;
  deliveryAddress: string;
  status: string;
  priority: string;
};

export function OrderStopList({ tripId, initialOrders }: { tripId: string; initialOrders: StopItem[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...orders];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setOrders(next);
    setDragIndex(null);
    startTransition(() => {
      reorderTripStopsAction(tripId, next.map((o) => o.id));
    });
  }

  if (orders.length === 0) {
    return <p className="text-sm text-slate-500">Aucun arret assigne a cette tournee.</p>;
  }

  return (
    <ul className="space-y-2">
      {orders.map((order, index) => (
        <li
          key={order.id}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
          className={`flex cursor-move items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 ${
            isPending ? "opacity-60" : ""
          }`}
        >
          <span className="flex items-center gap-3 text-sm">
            <span aria-hidden className="text-slate-400">⠿</span>
            <span className="font-semibold text-slate-400">{index + 1}.</span>
            <Link href={`/orders/${order.id}`} className="font-medium text-slate-800 hover:text-emerald-700">
              {order.reference}
            </Link>
            <span className="text-slate-500">{order.customerName} - {order.deliveryAddress}</span>
          </span>
          <span className="flex items-center gap-2">
            <StatusBadge status={order.priority} />
            <StatusBadge status={order.status} />
          </span>
        </li>
      ))}
    </ul>
  );
}
