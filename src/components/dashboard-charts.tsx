"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "#10b981",
  IN_USE: "#2563eb",
  MAINTENANCE: "#d97706",
  OUT_OF_SERVICE: "#dc2626",
  PENDING: "#d97706",
  ASSIGNED: "#2563eb",
  IN_PROGRESS: "#d97706",
  DELIVERED: "#10b981",
  FAILED: "#dc2626",
  CANCELLED: "#94a3b8",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  IN_USE: "En service",
  MAINTENANCE: "En entretien",
  OUT_OF_SERVICE: "Hors service",
  PENDING: "En attente",
  ASSIGNED: "Assignee",
  IN_PROGRESS: "En cours",
  DELIVERED: "Livree",
  FAILED: "Echec",
  CANCELLED: "Annulee",
};

export function TractorStatusChart({ data }: { data: { status: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Aucun tracteur enregistre.</p>;
  }

  return (
    <div className="flex items-center gap-6">
      <div className="h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={45} outerRadius={80} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number, _name, item) => [value, STATUS_LABELS[item.payload.status] ?? item.payload.status]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 text-sm">
        {data.map((entry) => (
          <li key={entry.status} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[entry.status] ?? "#94a3b8" }}
            />
            <span className="text-slate-600">{STATUS_LABELS[entry.status] ?? entry.status}</span>
            <span className="font-semibold text-slate-900">{entry.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OrdersStatusChart({ data }: { data: { status: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Aucune commande enregistree.</p>;
  }

  const chartData = data.map((d) => ({ ...d, label: STATUS_LABELS[d.status] ?? d.status }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
