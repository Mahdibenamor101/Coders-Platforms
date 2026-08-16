import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { driverSchema } from "@/lib/validation";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const driver = await prisma.driver.findFirst({
    where: { id: params.id, companyId: session.companyId },
  });
  if (!driver) return NextResponse.json({ error: "Chauffeur introuvable" }, { status: 404 });

  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  return NextResponse.json({ driver, portalLink: `${baseUrl}/driver/${driver.accessToken}` });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = driverSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const data = parsed.data;

  const { count } = await prisma.driver.updateMany({
    where: { id: params.id, companyId: session.companyId },
    data: {
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
  if (count === 0) return NextResponse.json({ error: "Chauffeur introuvable" }, { status: 404 });

  const driver = await prisma.driver.findUnique({ where: { id: params.id } });
  return NextResponse.json({ driver });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  await prisma.driver.deleteMany({ where: { id: params.id, companyId: session.companyId } });
  return NextResponse.json({ ok: true });
}
