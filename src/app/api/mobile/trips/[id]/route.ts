import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const trip = await prisma.trip.findFirst({
    where: { id: params.id, companyId: session.companyId },
    include: {
      tractor: true,
      trailer: true,
      driver: true,
      orders: { orderBy: { sequence: "asc" } },
    },
  });
  if (!trip) return NextResponse.json({ error: "Tournee introuvable" }, { status: 404 });
  return NextResponse.json({ trip });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  await prisma.trip.deleteMany({ where: { id: params.id, companyId: session.companyId } });
  return NextResponse.json({ ok: true });
}
