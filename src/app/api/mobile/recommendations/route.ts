import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const recommendations = await prisma.recommendation.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
  });
  const sorted = [...recommendations].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );
  return NextResponse.json({ recommendations: sorted });
}
