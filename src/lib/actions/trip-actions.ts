"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { tripSchema } from "@/lib/validation";
import { buildTripAssignmentMessage, sendWhatsAppMessage } from "@/lib/whatsapp";
import type { FormState } from "@/lib/actions/auth-actions";
import type { TripStatus } from "@/lib/enums";

function parseTripForm(formData: FormData) {
  return tripSchema.safeParse({
    tractorId: formData.get("tractorId"),
    trailerId: formData.get("trailerId") ?? "",
    driverId: formData.get("driverId"),
    origin: formData.get("origin"),
    destination: formData.get("destination"),
    departureAt: formData.get("departureAt"),
    estimatedArrivalAt: formData.get("estimatedArrivalAt") ?? "",
    cargoDescription: formData.get("cargoDescription") ?? "",
    distanceKm: formData.get("distanceKm") || undefined,
  });
}

export async function createTripAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  const parsed = parseTripForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;
  const notifyDriver = formData.get("notifyDriver") === "on";

  const [tractor, trailer, driver] = await Promise.all([
    prisma.tractor.findFirst({ where: { id: data.tractorId, companyId: session.companyId } }),
    data.trailerId
      ? prisma.trailer.findFirst({ where: { id: data.trailerId, companyId: session.companyId } })
      : Promise.resolve(null),
    prisma.driver.findFirst({ where: { id: data.driverId, companyId: session.companyId } }),
  ]);

  if (!tractor || !driver) {
    return { error: "Tracteur ou chauffeur introuvable." };
  }

  const trip = await prisma.trip.create({
    data: {
      companyId: session.companyId,
      tractorId: tractor.id,
      trailerId: trailer?.id ?? null,
      driverId: driver.id,
      origin: data.origin,
      destination: data.destination,
      departureAt: new Date(data.departureAt),
      estimatedArrivalAt: data.estimatedArrivalAt ? new Date(data.estimatedArrivalAt) : null,
      cargoDescription: data.cargoDescription || null,
      distanceKm: data.distanceKm ?? null,
    },
  });

  await prisma.tractor.updateMany({
    where: { id: tractor.id, companyId: session.companyId },
    data: { status: "IN_USE" },
  });
  if (trailer) {
    await prisma.trailer.updateMany({
      where: { id: trailer.id, companyId: session.companyId },
      data: { status: "IN_USE" },
    });
  }

  if (notifyDriver) {
    const message = buildTripAssignmentMessage({
      driverFirstName: driver.firstName,
      origin: data.origin,
      destination: data.destination,
      departureAt: new Date(data.departureAt),
      tractorPlate: tractor.plateNumber,
      trailerPlate: trailer?.plateNumber,
      cargoDescription: data.cargoDescription || null,
    });

    await sendWhatsAppMessage({
      companyId: session.companyId,
      toPhone: driver.phone,
      body: message,
      type: "TRIP_ASSIGNMENT",
      driverId: driver.id,
    });

    await prisma.trip.update({
      where: { id: trip.id },
      data: { driverNotifiedAt: new Date() },
    });
  }

  revalidatePath("/trips");
  revalidatePath("/tractors");
  revalidatePath("/trailers");
  redirect("/trips");
}

export async function notifyTripDriverAction(tripId: string) {
  const session = await requireSession();
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, companyId: session.companyId },
    include: { driver: true, tractor: true, trailer: true },
  });
  if (!trip) return;

  const message = buildTripAssignmentMessage({
    driverFirstName: trip.driver.firstName,
    origin: trip.origin,
    destination: trip.destination,
    departureAt: trip.departureAt,
    tractorPlate: trip.tractor.plateNumber,
    trailerPlate: trip.trailer?.plateNumber,
    cargoDescription: trip.cargoDescription,
  });

  await sendWhatsAppMessage({
    companyId: session.companyId,
    toPhone: trip.driver.phone,
    body: message,
    type: "TRIP_ASSIGNMENT",
    driverId: trip.driver.id,
  });

  await prisma.trip.update({ where: { id: trip.id }, data: { driverNotifiedAt: new Date() } });
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
}

export async function updateTripStatusAction(tripId: string, status: TripStatus) {
  const session = await requireSession();
  const trip = await prisma.trip.findFirst({ where: { id: tripId, companyId: session.companyId } });
  if (!trip) return;

  await prisma.trip.updateMany({
    where: { id: tripId, companyId: session.companyId },
    data: {
      status,
      actualArrivalAt: status === "COMPLETED" ? new Date() : trip.actualArrivalAt,
    },
  });

  if (status === "COMPLETED" || status === "CANCELLED") {
    await prisma.tractor.updateMany({
      where: { id: trip.tractorId, companyId: session.companyId },
      data: { status: "AVAILABLE" },
    });
    if (trip.trailerId) {
      await prisma.trailer.updateMany({
        where: { id: trip.trailerId, companyId: session.companyId },
        data: { status: "AVAILABLE" },
      });
    }
  }

  revalidatePath("/trips");
  revalidatePath("/tractors");
  revalidatePath("/trailers");
}

export async function deleteTripAction(tripId: string) {
  const session = await requireSession();
  await prisma.trip.deleteMany({ where: { id: tripId, companyId: session.companyId } });
  revalidatePath("/trips");
}
