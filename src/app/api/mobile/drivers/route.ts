import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { driverSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const drivers = await prisma.driver.findMany({
    where: { companyId: session.companyId },
    orderBy: { lastName: "asc" },
  });
  return NextResponse.json({ drivers });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = driverSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const data = parsed.data;

  const driver = await prisma.driver.create({
    data: {
      companyId: session.companyId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      licenseExpiry: new Date(data.licenseExpiry),
      status: data.status,
      hireDate: data.hireDate ? new Date(data.hireDate) : null,
      notes: data.notes || null,
      skills: data.skills || null,
      costPerKm: data.costPerKm ?? null,
    },
  });

  return NextResponse.json({ driver }, { status: 201 });
}
