import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRecommendationsForCompany } from "@/lib/recommendations";
import { PageHeader, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };

function StatCard({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} className="card block p-5 transition hover:border-emerald-300 hover:shadow-md">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await requireSession();
  const companyId = session.companyId;

  await generateRecommendationsForCompany(companyId);

  const [
    tractorCount,
    trailerCount,
    driverCount,
    activeTripCount,
    upcomingTrips,
    recommendations,
    recentMessages,
    tractorsByStatus,
  ] = await Promise.all([
    prisma.tractor.count({ where: { companyId } }),
    prisma.trailer.count({ where: { companyId } }),
    prisma.driver.count({ where: { companyId } }),
    prisma.trip.count({ where: { companyId, status: { in: ["PLANNED", "IN_PROGRESS"] } } }),
    prisma.trip.findMany({
      where: { companyId, status: { in: ["PLANNED", "IN_PROGRESS"] } },
      include: { driver: true, tractor: true },
      orderBy: { departureAt: "asc" },
      take: 5,
    }),
    prisma.recommendation.findMany({
      where: { companyId, resolved: false },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.whatsAppMessage.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.tractor.groupBy({ by: ["status"], where: { companyId }, _count: true }),
  ]);

  const sortedRecommendations = [...recommendations].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre flotte et des actions prioritaires."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Tracteurs" value={tractorCount} href="/tractors" />
        <StatCard label="Remorques" value={trailerCount} href="/trailers" />
        <StatCard label="Chauffeurs" value={driverCount} href="/drivers" />
        <StatCard label="Missions actives" value={activeTripCount} href="/trips" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recommandations prioritaires</h2>
            <Link href="/recommendations" className="text-sm font-medium text-emerald-700 hover:underline">
              Voir tout
            </Link>
          </div>
          {sortedRecommendations.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune recommandation active. Tout est en ordre !</p>
          ) : (
            <ul className="space-y-3">
              {sortedRecommendations.map((rec) => (
                <li key={rec.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={rec.severity} />
                      <span className="text-sm font-medium text-slate-800">{rec.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{rec.entityLabel}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Prochains departs</h2>
            <Link href="/trips" className="text-sm font-medium text-emerald-700 hover:underline">
              Voir tout
            </Link>
          </div>
          {upcomingTrips.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune mission planifiee.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingTrips.map((trip) => (
                <li key={trip.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">
                      {trip.origin} → {trip.destination}
                    </span>
                    <StatusBadge status={trip.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {trip.driver.firstName} {trip.driver.lastName} · {trip.tractor.plateNumber} ·{" "}
                    {formatDateTime(trip.departureAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Etat du parc tracteurs</h2>
          {tractorsByStatus.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun tracteur enregistre.</p>
          ) : (
            <ul className="space-y-2">
              {tractorsByStatus.map((row) => (
                <li key={row.status} className="flex items-center justify-between text-sm">
                  <StatusBadge status={row.status} />
                  <span className="font-medium text-slate-700">{row._count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Derniers messages WhatsApp</h2>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun message envoye pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {recentMessages.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-slate-800">{m.toPhone}</div>
                    <div className="text-xs text-slate-500">{formatDateTime(m.createdAt)}</div>
                  </div>
                  <StatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
