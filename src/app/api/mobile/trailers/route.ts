import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { trailerSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const trailers = await prisma.trailer.findMany({
    where: { companyId: session.companyId },
    orderBy: { plateNumber: "asc" },
  });
  return NextResponse.json({ trailers });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = trailerSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const data = parsed.data;

  const trailer = await prisma.trailer.create({
    data: {
      companyId: session.companyId,
      plateNumber: data.plateNumber,
      type: data.type,
      capacityTons: data.capacityTons ?? null,
      status: data.status,
      nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate) : null,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
      notes: data.notes || null,
    },
  });

  return NextResponse.json({ trailer }, { status: 201 });
}
