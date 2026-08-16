import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { reorderTripOrders } from "@/lib/planning";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const trip = await prisma.trip.findFirst({ where: { id: params.id, companyId: session.companyId } });
  if (!trip) return NextResponse.json({ error: "Tournee introuvable" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const orderIds = body?.orderIds;
  if (!Array.isArray(orderIds) || !orderIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "Liste d'identifiants invalide" }, { status: 400 });
  }

  await reorderTripOrders(params.id, orderIds);
  return NextResponse.json({ ok: true });
}
