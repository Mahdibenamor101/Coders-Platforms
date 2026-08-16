import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { trailerSchema } from "@/lib/validation";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const trailer = await prisma.trailer.findFirst({
    where: { id: params.id, companyId: session.companyId },
  });
  if (!trailer) return NextResponse.json({ error: "Remorque introuvable" }, { status: 404 });
  return NextResponse.json({ trailer });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = trailerSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const data = parsed.data;

  const { count } = await prisma.trailer.updateMany({
    where: { id: params.id, companyId: session.companyId },
    data: {
      plateNumber: data.plateNumber,
      type: data.type,
      capacityTons: data.capacityTons ?? null,
      status: data.status,
      nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate) : null,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
      notes: data.notes || null,
    },
  });
  if (count === 0) return NextResponse.json({ error: "Remorque introuvable" }, { status: 404 });

  const trailer = await prisma.trailer.findUnique({ where: { id: params.id } });
  return NextResponse.json({ trailer });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  await prisma.trailer.deleteMany({ where: { id: params.id, companyId: session.companyId } });
  return NextResponse.json({ ok: true });
}
