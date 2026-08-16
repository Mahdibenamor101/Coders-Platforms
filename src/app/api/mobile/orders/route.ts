import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { orderSchema } from "@/lib/validation";
import { geocodeAddress } from "@/lib/geo";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    include: { trip: { select: { id: true, status: true } } },
  });
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const data = parsed.data;

  const [pickup, delivery] = await Promise.all([
    geocodeAddress(data.pickupAddress),
    geocodeAddress(data.deliveryAddress),
  ]);

  const count = await prisma.order.count({ where: { companyId: session.companyId } });
  const reference = data.reference || `CMD-${String(count + 1).padStart(4, "0")}`;

  const order = await prisma.order.create({
    data: {
      companyId: session.companyId,
      reference,
      customerName: data.customerName,
      customerPhone: data.customerPhone || null,
      pickupAddress: data.pickupAddress,
      pickupLat: pickup?.lat ?? null,
      pickupLng: pickup?.lng ?? null,
      deliveryAddress: data.deliveryAddress,
      deliveryLat: delivery?.lat ?? null,
      deliveryLng: delivery?.lng ?? null,
      priority: data.priority,
      requiredSkills: data.requiredSkills || null,
      serviceDurationMin: data.serviceDurationMin,
      timeWindowStart: data.timeWindowStart ? new Date(data.timeWindowStart) : null,
      timeWindowEnd: data.timeWindowEnd ? new Date(data.timeWindowEnd) : null,
      weightKg: data.weightKg ?? null,
      hazmat: data.hazmat,
    },
  });

  return NextResponse.json({ order }, { status: 201 });
}
