import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { planOrders } from "@/lib/planning";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const result = await planOrders(session.companyId);
  return NextResponse.json(result);
}
