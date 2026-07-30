"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { orderSchema } from "@/lib/validation";
import { geocodeAddress } from "@/lib/geo";
import { planOrders, resequenceTrip, reorderTripOrders } from "@/lib/planning";
import type { FormState } from "@/lib/actions/auth-actions";

function parseOrderForm(formData: FormData) {
  return orderSchema.safeParse({
    reference: formData.get("reference") ?? "",
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone") ?? "",
    pickupAddress: formData.get("pickupAddress"),
    deliveryAddress: formData.get("deliveryAddress"),
    priority: formData.get("priority") || "MEDIUM",
    requiredSkills: formData.get("requiredSkills") ?? "",
    serviceDurationMin: formData.get("serviceDurationMin") || 15,
    timeWindowStart: formData.get("timeWindowStart") ?? "",
    timeWindowEnd: formData.get("timeWindowEnd") ?? "",
    weightKg: formData.get("weightKg") || undefined,
    hazmat: formData.get("hazmat") === "on",
  });
}

export async function createOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  const parsed = parseOrderForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  const [pickup, delivery] = await Promise.all([
    geocodeAddress(data.pickupAddress),
    geocodeAddress(data.deliveryAddress),
  ]);

  const count = await prisma.order.count({ where: { companyId: session.companyId } });
  const reference = data.reference || `CMD-${String(count + 1).padStart(4, "0")}`;

  await prisma.order.create({
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

  revalidatePath("/orders");
  redirect("/orders");
}

export async function updateOrderAction(
  orderId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();
  const parsed = parseOrderForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  const existing = await prisma.order.findFirst({
    where: { id: orderId, companyId: session.companyId },
  });
  if (!existing) return { error: "Commande introuvable." };

  const pickup =
    data.pickupAddress !== existing.pickupAddress
      ? await geocodeAddress(data.pickupAddress)
      : { lat: existing.pickupLat, lng: existing.pickupLng };
  const delivery =
    data.deliveryAddress !== existing.deliveryAddress
      ? await geocodeAddress(data.deliveryAddress)
      : { lat: existing.deliveryLat, lng: existing.deliveryLng };

  await prisma.order.updateMany({
    where: { id: orderId, companyId: session.companyId },
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

  if (existing.tripId) {
    await resequenceTrip(existing.tripId);
  }

  revalidatePath("/orders");
  redirect("/orders");
}

export async function deleteOrderAction(orderId: string) {
  const session = await requireSession();
  const order = await prisma.order.findFirst({ where: { id: orderId, companyId: session.companyId } });
  if (!order) return;

  await prisma.order.deleteMany({ where: { id: orderId, companyId: session.companyId } });

  if (order.tripId) {
    await resequenceTrip(order.tripId);
  }

  revalidatePath("/orders");
}

export async function unassignOrderAction(orderId: string) {
  const session = await requireSession();
  const order = await prisma.order.findFirst({ where: { id: orderId, companyId: session.companyId } });
  if (!order) return;

  await prisma.order.updateMany({
    where: { id: orderId, companyId: session.companyId },
    data: { tripId: null, sequence: null, status: "PENDING" },
  });

  if (order.tripId) {
    await resequenceTrip(order.tripId);
  }

  revalidatePath("/orders");
  revalidatePath("/trips");
}

export type PlanningState =
  | {
      assigned: number;
      skippedNoCoords: number;
      skippedNoCapacity: number;
      routesTouched: number;
      messages: string[];
    }
  | undefined;

export async function runAutoPlanningAction(
  _prev: PlanningState,
  _formData: FormData
): Promise<PlanningState> {
  const session = await requireSession();
  const result = await planOrders(session.companyId);
  revalidatePath("/orders");
  revalidatePath("/trips");
  revalidatePath("/dashboard");
  return result;
}

export async function reorderTripStopsAction(tripId: string, orderIdsInOrder: string[]) {
  const session = await requireSession();
  const trip = await prisma.trip.findFirst({ where: { id: tripId, companyId: session.companyId } });
  if (!trip) return;

  await reorderTripOrders(tripId, orderIdsInOrder);

  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/orders");
  revalidatePath("/live");
}
