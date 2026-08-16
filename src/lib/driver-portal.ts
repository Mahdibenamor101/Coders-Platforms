import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { notifyCustomer } from "@/lib/customer-notify";
import { podSchema } from "@/lib/validation";

/**
 * Business logic shared between the web driver portal (Server Actions,
 * src/lib/actions/driver-portal-actions.ts) and the JSON API used by the
 * React Native driver app (src/app/api/mobile/driver/**). Keeping it here
 * once avoids the two clients drifting apart.
 */

export async function getDriverByToken(token: string) {
  return prisma.driver.findUnique({ where: { accessToken: token } });
}

export async function getDriverTrips(token: string) {
  const driver = await getDriverByToken(token);
  if (!driver) return null;

  const trips = await prisma.trip.findMany({
    where: { driverId: driver.id, status: { in: ["PLANNED", "IN_PROGRESS"] } },
    include: {
      tractor: true,
      trailer: true,
      orders: { orderBy: { sequence: "asc" } },
    },
    orderBy: { departureAt: "asc" },
  });

  return { driver, trips };
}

export async function getOrderForDriver(token: string, orderId: string) {
  const driver = await getDriverByToken(token);
  if (!driver) return null;

  return prisma.order.findFirst({
    where: { id: orderId, trip: { driverId: driver.id } },
    include: { trip: true },
  });
}

export async function refreshTripStatusIfNeeded(tripId: string) {
  const trip = await prisma.trip.findUniqueOrThrow({
    where: { id: tripId },
    include: { orders: true },
  });

  if (trip.status === "PLANNED" && trip.orders.some((o) => o.status === "IN_PROGRESS")) {
    await prisma.trip.update({ where: { id: tripId }, data: { status: "IN_PROGRESS" } });
  }

  const allDone =
    trip.orders.length > 0 &&
    trip.orders.every((o) => ["DELIVERED", "FAILED", "CANCELLED"].includes(o.status));
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

export async function startOrder(token: string, orderId: string) {
  const order = await getOrderForDriver(token, orderId);
  if (!order) return { error: "Commande introuvable." as const };

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "IN_PROGRESS" },
  });
  await notifyCustomer(updated);
  if (order.tripId) await refreshTripStatusIfNeeded(order.tripId);

  return { order: updated };
}

export async function failOrder(token: string, orderId: string, reason: string | null) {
  const order = await getOrderForDriver(token, orderId);
  if (!order) return { error: "Commande introuvable." as const };

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "FAILED", podNotes: reason },
  });
  await notifyCustomer(updated);
  if (order.tripId) await refreshTripStatusIfNeeded(order.tripId);

  return { order: updated };
}

export async function storePodPhoto(orderId: string, photo: File): Promise<string> {
  const extension = (photo.type.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "");
  const filename = `${orderId}-${Date.now()}.${extension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`pod/${filename}`, photo, { access: "public" });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pod");
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await photo.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/pod/${filename}`;
}

export async function submitProofOfDelivery(
  token: string,
  orderId: string,
  input: { podSignature?: string; podNotes?: string; podBarcode?: string; photo?: File | null }
) {
  const order = await getOrderForDriver(token, orderId);
  if (!order) return { error: "Commande introuvable." as const };

  const parsed = podSchema.safeParse({
    podSignature: input.podSignature ?? "",
    podNotes: input.podNotes ?? "",
    podBarcode: input.podBarcode ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  let podPhotoPath: string | null = null;
  if (input.photo && input.photo.size > 0) {
    podPhotoPath = await storePodPhoto(orderId, input.photo);
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

  return { order: updated };
}
