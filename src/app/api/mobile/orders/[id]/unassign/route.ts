import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { resequenceTrip } from "@/lib/planning";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const order = await prisma.order.findFirst({ where: { id: params.id, companyId: session.companyId } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  await prisma.order.updateMany({
    where: { id: params.id, companyId: session.companyId },
    data: { tripId: null, sequence: null, status: "PENDING" },
  });

  if (order.tripId) await resequenceTrip(order.tripId);

  return NextResponse.json({ ok: true });
}
