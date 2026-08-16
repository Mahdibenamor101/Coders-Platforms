import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { orderSchema } from "@/lib/validation";
import { geocodeAddress } from "@/lib/geo";
import { resequenceTrip } from "@/lib/planning";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: { id: params.id, companyId: session.companyId },
    include: { trip: { include: { tractor: true, trailer: true, driver: true } } },
  });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const existing = await prisma.order.findFirst({ where: { id: params.id, companyId: session.companyId } });
  if (!existing) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const data = parsed.data;

  const pickup =
    data.pickupAddress !== existing.pickupAddress
      ? await geocodeAddress(data.pickupAddress)
      : { lat: existing.pickupLat, lng: existing.pickupLng };
  const delivery =
    data.deliveryAddress !== existing.deliveryAddress
      ? await geocodeAddress(data.deliveryAddress)
      : { lat: existing.deliveryLat, lng: existing.deliveryLng };

  await prisma.order.updateMany({
    where: { id: params.id, companyId: session.companyId },
    data: {
      reference: data.reference || existing.reference,
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

  if (existing.tripId) await resequenceTrip(existing.tripId);

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  return NextResponse.json({ order });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const order = await prisma.order.findFirst({ where: { id: params.id, companyId: session.companyId } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  await prisma.order.deleteMany({ where: { id: params.id, companyId: session.companyId } });
  if (order.tripId) await resequenceTrip(order.tripId);

  return NextResponse.json({ ok: true });
}
