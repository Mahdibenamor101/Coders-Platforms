import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  IN_USE: "bg-blue-100 text-blue-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  OUT_OF_SERVICE: "bg-red-100 text-red-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  ON_LEAVE: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-700",
  PLANNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-200 text-slate-600",
  INFO: "bg-blue-100 text-blue-700",
  WARNING: "bg-amber-100 text-amber-700",
  CRITICAL: "bg-red-100 text-red-700",
  SENT: "bg-emerald-100 text-emerald-700",
  SIMULATED: "bg-slate-200 text-slate-600",
  FAILED: "bg-red-100 text-red-700",
  PENDING: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  IN_USE: "En service",
  MAINTENANCE: "En entretien",
  OUT_OF_SERVICE: "Hors service",
  ACTIVE: "Actif",
  ON_LEAVE: "En conge",
  SUSPENDED: "Suspendu",
  PLANNED: "Planifiee",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminee",
  CANCELLED: "Annulee",
  INFO: "Info",
  WARNING: "Attention",
  CRITICAL: "Critique",
  SENT: "Envoye",
  SIMULATED: "Simule",
  FAILED: "Echec",
  PENDING: "En attente",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description, action }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <p className="text-base font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}

export function LinkButton({
  href,
  children,
  className = "btn-primary",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
