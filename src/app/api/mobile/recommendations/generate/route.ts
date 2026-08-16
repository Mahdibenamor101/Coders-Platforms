import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { generateRecommendationsForCompany } from "@/lib/recommendations";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  await generateRecommendationsForCompany(session.companyId);
  return NextResponse.json({ ok: true });
}
