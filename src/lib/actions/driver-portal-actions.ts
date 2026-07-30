"use server";

import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { notifyCustomer } from "@/lib/customer-notify";
import { podSchema } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth-actions";

async function getOrderForDriver(token: string, orderId: string) {
  const driver = await prisma.driver.findUnique({ where: { accessToken: token } });
  if (!driver) return null;

  const order = await prisma.order.findFirst({
    where: { id: orderId, trip: { driverId: driver.id } },
    include: { trip: true },
  });
  return order;
}

async function refreshTripStatusIfNeeded(tripId: string) {
  const trip = await prisma.trip.findUniqueOrThrow({
    where: { id: tripId },
    include: { orders: true },
  });

  if (trip.status === "PLANNED" && trip.orders.some((o) => o.status === "IN_PROGRESS")) {
    await prisma.trip.update({ where: { id: tripId }, data: { status: "IN_PROGRESS" } });
  }

  const allDone = trip.orders.length > 0 && trip.orders.every((o) => ["DELIVERED", "FAILED", "CANCELLED"].includes(o.status));
  if (allDone && trip.status !== "COMPLETED") {
    await prisma.trip.update({
      where: { id: tripId },
      data: { status: "COMPLETED", actualArrivalAt: new Date() },
    });
    await prisma.tractor.update({ where: { id: trip.tractorId }, data: { status: "AVAILABLE" } });
    if (trip.trailerId) {
      await prisma.trailer.update({ where: { id: trip.trailerId }, data: { status: "AVAILABLE" } });
    }
  }
}

export async function startOrderAction(token: string, orderId: string) {
  const order = await getOrderForDriver(token, orderId);
  if (!order) return;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "IN_PROGRESS" },
  });
  await notifyCustomer(updated);

  if (order.tripId) await refreshTripStatusIfNeeded(order.tripId);

  revalidatePath(`/driver/${token}`);
}

export async function failOrderAction(token: string, orderId: string, formData: FormData) {
  const order = await getOrderForDriver(token, orderId);
  if (!order) return;

  const reason = (formData.get("reason") as string) || null;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "FAILED", podNotes: reason },
  });
  await notifyCustomer(updated);

  if (order.tripId) await refreshTripStatusIfNeeded(order.tripId);

  revalidatePath(`/driver/${token}`);
}

export async function submitProofOfDeliveryAction(
  token: string,
  orderId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const order = await getOrderForDriver(token, orderId);
  if (!order) return { error: "Commande introuvable." };

  const parsed = podSchema.safeParse({
    podSignature: formData.get("podSignature") ?? "",
    podNotes: formData.get("podNotes") ?? "",
    podBarcode: formData.get("podBarcode") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  let podPhotoPath: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "pod");
    await mkdir(uploadsDir, { recursive: true });
    const extension = (photo.type.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "");
    const filename = `${orderId}-${Date.now()}.${extension}`;
    const buffer = Buffer.from(await photo.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);
    podPhotoPath = `/uploads/pod/${filename}`;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "DELIVERED",
      deliveredAt: new Date(),
      podSignature: data.podSignature || null,
      podNotes: data.podNotes || null,
      podBarcode: data.podBarcode || null,
      podPhotoPath: podPhotoPath ?? undefined,
    },
  });

  await notifyCustomer(updated);

  if (order.tripId) await refreshTripStatusIfNeeded(order.tripId);

  revalidatePath(`/driver/${token}`);
  return { error: undefined };
}
