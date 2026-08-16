import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  await prisma.maintenanceRecord.deleteMany({ where: { id: params.id, companyId: session.companyId } });
  return NextResponse.json({ ok: true });
}
