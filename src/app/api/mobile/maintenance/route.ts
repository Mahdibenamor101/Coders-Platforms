import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { maintenanceSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const records = await prisma.maintenanceRecord.findMany({
    where: { companyId: session.companyId },
    orderBy: { performedAt: "desc" },
    include: { tractor: { select: { plateNumber: true } }, trailer: { select: { plateNumber: true } } },
  });
  return NextResponse.json({ records });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = maintenanceSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const data = parsed.data;

  if (data.tractorId) {
    const tractor = await prisma.tractor.findFirst({ where: { id: data.tractorId, companyId: session.companyId } });
    if (!tractor) return NextResponse.json({ error: "Tracteur introuvable." }, { status: 400 });
  }
  if (data.trailerId) {
    const trailer = await prisma.trailer.findFirst({ where: { id: data.trailerId, companyId: session.companyId } });
    if (!trailer) return NextResponse.json({ error: "Remorque introuvable." }, { status: 400 });
  }

  const record = await prisma.maintenanceRecord.create({
    data: {
      companyId: session.companyId,
      tractorId: data.tractorId || null,
      trailerId: data.trailerId || null,
      type: data.type,
      performedAt: new Date(data.performedAt),
      mileage: data.mileage ?? null,
      cost: data.cost ?? null,
      notes: data.notes || null,
      nextDueAt: data.nextDueAt ? new Date(data.nextDueAt) : null,
      nextDueMileage: data.nextDueMileage ?? null,
    },
  });

  if (data.tractorId) {
    await prisma.tractor.updateMany({
      where: { id: data.tractorId, companyId: session.companyId },
      data: {
        lastMaintenanceDate: new Date(data.performedAt),
        ...(data.mileage != null ? { lastMaintenanceMileage: data.mileage, mileage: data.mileage } : {}),
        ...(data.nextDueMileage != null ? { nextMaintenanceMileage: data.nextDueMileage } : {}),
      },
    });
  }
  if (data.trailerId) {
    await prisma.trailer.updateMany({
      where: { id: data.trailerId, companyId: session.companyId },
      data: {
        lastInspectionDate: new Date(data.performedAt),
        ...(data.nextDueAt ? { nextInspectionDate: new Date(data.nextDueAt) } : {}),
      },
    });
  }

  return NextResponse.json({ record }, { status: 201 });
}
