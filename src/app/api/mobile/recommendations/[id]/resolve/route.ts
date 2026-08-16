import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  await prisma.recommendation.updateMany({
    where: { id: params.id, companyId: session.companyId },
    data: { resolved: true, resolvedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
