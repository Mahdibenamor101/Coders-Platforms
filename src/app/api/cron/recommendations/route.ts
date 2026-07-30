import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRecommendationsForCompany } from "@/lib/recommendations";

// Must run per-request (touches the database on every call) - never statically prerendered.
export const dynamic = "force-dynamic";

/**
 * Cron endpoint: regenerates recommendations for every company.
 * Protect with CRON_SECRET in production (e.g. Vercel Cron "Authorization: Bearer <secret>").
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const companies = await prisma.company.findMany({ select: { id: true } });
  const results = await Promise.all(
    companies.map((c) => generateRecommendationsForCompany(c.id))
  );

  const totalGenerated = results.reduce((sum, r) => sum + r.generated, 0);
  const totalAutoResolved = results.reduce((sum, r) => sum + r.autoResolved, 0);

  return NextResponse.json({
    companies: companies.length,
    totalGenerated,
    totalAutoResolved,
  });
}
