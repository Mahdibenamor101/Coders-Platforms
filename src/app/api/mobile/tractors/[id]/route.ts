import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { tractorSchema } from "@/lib/validation";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const tractor = await prisma.tractor.findFirst({
    where: { id: params.id, companyId: session.companyId },
  });
  if (!tractor) return NextResponse.json({ error: "Tracteur introuvable" }, { status: 404 });
  return NextResponse.json({ tractor });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = tractorSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const data = parsed.data;

  const { count } = await prisma.tractor.updateMany({
    where: { id: params.id, companyId: session.companyId },
    data: {
      plateNumber: data.plateNumber,
      brand: data.brand,
      model: data.model,
      year: data.year ?? null,
      mileage: data.mileage,
      status: data.status,
      nextMaintenanceMileage: data.nextMaintenanceMileage ?? null,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
      technicalControlExpiry: data.technicalControlExpiry ? new Date(data.technicalControlExpiry) : null,
      notes: data.notes || null,
      costPerKm: data.costPerKm ?? null,
      hazmatCertified: data.hazmatCertified,
      fuelLevelPercent: data.fuelLevelPercent ?? null,
      adBlueLevelPercent: data.adBlueLevelPercent ?? null,
    },
  });
  if (count === 0) return NextResponse.json({ error: "Tracteur introuvable" }, { status: 404 });

  const tractor = await prisma.tractor.findUnique({ where: { id: params.id } });
  return NextResponse.json({ tractor });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  await prisma.tractor.deleteMany({ where: { id: params.id, companyId: session.companyId } });
  return NextResponse.json({ ok: true });
}
