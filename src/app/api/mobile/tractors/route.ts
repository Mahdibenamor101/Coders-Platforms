import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { tractorSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const tractors = await prisma.tractor.findMany({
    where: { companyId: session.companyId },
    orderBy: { plateNumber: "asc" },
  });
  return NextResponse.json({ tractors });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = tractorSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const data = parsed.data;

  const tractor = await prisma.tractor.create({
    data: {
      companyId: session.companyId,
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

  return NextResponse.json({ tractor }, { status: 201 });
}
