import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { generateRecommendationsForCompany } from "@/lib/recommendations";

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const companyId = session.companyId;

  await generateRecommendationsForCompany(companyId);

  const [
    tractorCount,
    trailerCount,
    driverCount,
    activeTripCount,
    upcomingTrips,
    recommendations,
    tractorsByStatus,
    ordersByStatus,
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
    prisma.tractor.groupBy({ by: ["status"], where: { companyId }, _count: true }),
    prisma.order.groupBy({ by: ["status"], where: { companyId }, _count: true }),
  ]);

  const sortedRecommendations = [...recommendations].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return NextResponse.json({
    stats: { tractorCount, trailerCount, driverCount, activeTripCount },
    upcomingTrips,
    recommendations: sortedRecommendations,
    tractorsByStatus,
    ordersByStatus,
  });
}
