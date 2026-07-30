import { prisma } from "./prisma";
import { haversineKm, computeRoute, type LatLng } from "./geo";
import type { Order } from "@prisma/client";

/**
 * Greedy nearest-insertion heuristic for multi-stop route planning. This is
 * NOT a true VRP solver (no OR-Tools/branch-and-bound) - it assigns each
 * pending order to the feasible route whose current position is closest to
 * the order's pickup point, then sequences each route with nearest-neighbor.
 * Good enough to auto-fill routes respecting skills/capacity/hazmat and to
 * keep dispatchers out of manual assignment for the common case; dispatchers
 * can still hand-adjust via drag-and-drop afterwards.
 */

const PRIORITY_RANK: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const DEFAULT_CAPACITY_KG = 20000;
const DEFAULT_COST_PER_KM = 1;
const DEFAULT_TRIP_LEAD_HOURS = 2;

type Candidate = {
  tripId: string | null;
  driverId: string;
  tractorId: string;
  trailerId: string | null;
  skills: string[];
  hazmatCertified: boolean;
  capacityKg: number;
  usedKg: number;
  costPerKm: number;
  referencePoint: LatLng;
};

function parseSkills(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function hasRequiredSkills(driverSkills: string[], required: string[]): boolean {
  return required.every((skill) => driverSkills.includes(skill));
}

export async function planOrders(companyId: string) {
  const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  const depot: LatLng | null =
    company.depotLat != null && company.depotLng != null
      ? { lat: company.depotLat, lng: company.depotLng }
      : null;

  const messages: string[] = [];
  if (!depot) {
    messages.push(
      "Aucun depot configure (Parametres) : la planification demarre chaque tournee depuis le premier point d'enlevement."
    );
  }

  const allPending = await prisma.order.findMany({ where: { companyId, status: "PENDING" } });
  const geocodable = allPending.filter(
    (o) => o.pickupLat != null && o.pickupLng != null && o.deliveryLat != null && o.deliveryLng != null
  );
  const skippedNoCoords = allPending.length - geocodable.length;

  const ordersToPlan = [...geocodable].sort((a, b) => {
    const rankDiff = (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2);
    if (rankDiff !== 0) return rankDiff;
    const aTime = a.timeWindowStart?.getTime() ?? Number.POSITIVE_INFINITY;
    const bTime = b.timeWindowStart?.getTime() ?? Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });

  const openTrips = await prisma.trip.findMany({
    where: { companyId, status: "PLANNED" },
    include: { orders: true, tractor: true, trailer: true, driver: true },
  });

  const candidates: Candidate[] = openTrips.map((trip) => {
    const activeOrders = trip.orders.filter((o) => o.status !== "CANCELLED" && o.status !== "FAILED");
    const usedKg = activeOrders.reduce((sum, o) => sum + (o.weightKg ?? 0), 0);
    const lastOrder = [...activeOrders]
      .filter((o) => o.sequence != null)
      .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
      .at(-1);
    const referencePoint: LatLng =
      lastOrder?.deliveryLat != null && lastOrder?.deliveryLng != null
        ? { lat: lastOrder.deliveryLat, lng: lastOrder.deliveryLng }
        : depot ?? { lat: 0, lng: 0 };

    return {
      tripId: trip.id,
      driverId: trip.driverId,
      tractorId: trip.tractorId,
      trailerId: trip.trailerId,
      skills: parseSkills(trip.driver.skills),
      hazmatCertified: trip.tractor.hazmatCertified,
      capacityKg: trip.trailer?.capacityTons != null ? trip.trailer.capacityTons * 1000 : DEFAULT_CAPACITY_KG,
      usedKg,
      costPerKm: trip.tractor.costPerKm ?? trip.driver.costPerKm ?? DEFAULT_COST_PER_KM,
      referencePoint,
    };
  });

  const busyDriverIds = openTrips.map((t) => t.driverId);
  const busyTractorIds = openTrips.map((t) => t.tractorId);

  const [availableDrivers, availableTractors, availableTrailers] = await Promise.all([
    prisma.driver.findMany({ where: { companyId, status: "ACTIVE", id: { notIn: busyDriverIds } } }),
    prisma.tractor.findMany({ where: { companyId, status: "AVAILABLE", id: { notIn: busyTractorIds } } }),
    prisma.trailer.findMany({ where: { companyId, status: "AVAILABLE" } }),
  ]);

  const fallbackReference: LatLng = depot ??
    (ordersToPlan[0] ? { lat: ordersToPlan[0].pickupLat!, lng: ordersToPlan[0].pickupLng! } : { lat: 0, lng: 0 });

  const pairCount = Math.min(availableDrivers.length, availableTractors.length);
  for (let i = 0; i < pairCount; i++) {
    const driver = availableDrivers[i];
    const tractor = availableTractors[i];
    const trailer = availableTrailers[i] ?? null;
    candidates.push({
      tripId: null,
      driverId: driver.id,
      tractorId: tractor.id,
      trailerId: trailer?.id ?? null,
      skills: parseSkills(driver.skills),
      hazmatCertified: tractor.hazmatCertified,
      capacityKg: trailer?.capacityTons != null ? trailer.capacityTons * 1000 : DEFAULT_CAPACITY_KG,
      usedKg: 0,
      costPerKm: tractor.costPerKm ?? driver.costPerKm ?? DEFAULT_COST_PER_KM,
      referencePoint: fallbackReference,
    });
  }

  const touchedTripIds = new Set<string>();
  const newRoutes: { candidate: Candidate; orderIds: string[] }[] = [];
  let assignedCount = 0;
  let skippedNoCapacity = 0;

  for (const order of ordersToPlan) {
    const pickup: LatLng = { lat: order.pickupLat!, lng: order.pickupLng! };
    const delivery: LatLng = { lat: order.deliveryLat!, lng: order.deliveryLng! };
    const requiredSkills = parseSkills(order.requiredSkills);
    const weight = order.weightKg ?? 0;

    let best: Candidate | null = null;
    let bestDistance = Infinity;

    for (const candidate of candidates) {
      if (!hasRequiredSkills(candidate.skills, requiredSkills)) continue;
      if (order.hazmat && !candidate.hazmatCertified) continue;
      if (candidate.usedKg + weight > candidate.capacityKg) continue;

      const distance = haversineKm(candidate.referencePoint, pickup);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }

    if (!best) {
      skippedNoCapacity++;
      continue;
    }

    best.usedKg += weight;
    best.referencePoint = delivery;
    assignedCount++;

    if (best.tripId) {
      touchedTripIds.add(best.tripId);
      await prisma.order.update({
        where: { id: order.id },
        data: { tripId: best.tripId, status: "ASSIGNED" },
      });
    } else {
      let route = newRoutes.find((r) => r.candidate === best);
      if (!route) {
        route = { candidate: best, orderIds: [] };
        newRoutes.push(route);
      }
      route.orderIds.push(order.id);
    }
  }

  for (const route of newRoutes) {
    const firstOrder = await prisma.order.findUniqueOrThrow({ where: { id: route.orderIds[0] } });
    const trip = await prisma.trip.create({
      data: {
        companyId,
        driverId: route.candidate.driverId,
        tractorId: route.candidate.tractorId,
        trailerId: route.candidate.trailerId,
        origin: company.depotAddress ?? "Depot",
        destination: "Tournee multi-arrets",
        departureAt:
          firstOrder.timeWindowStart ?? new Date(Date.now() + DEFAULT_TRIP_LEAD_HOURS * 60 * 60 * 1000),
        status: "PLANNED",
      },
    });

    await prisma.order.updateMany({
      where: { id: { in: route.orderIds } },
      data: { tripId: trip.id, status: "ASSIGNED" },
    });

    await prisma.tractor.updateMany({
      where: { id: route.candidate.tractorId, companyId },
      data: { status: "IN_USE" },
    });
    if (route.candidate.trailerId) {
      await prisma.trailer.updateMany({
        where: { id: route.candidate.trailerId, companyId },
        data: { status: "IN_USE" },
      });
    }

    touchedTripIds.add(trip.id);
  }

  for (const tripId of Array.from(touchedTripIds)) {
    await resequenceTrip(tripId);
  }

  return {
    assigned: assignedCount,
    skippedNoCoords,
    skippedNoCapacity,
    routesTouched: touchedTripIds.size,
    messages,
  };
}

function sequenceOrdersNearestNeighbor(depot: LatLng | null, orders: Order[]): Order[] {
  const remaining = [...orders];
  const result: Order[] = [];
  let current: LatLng | null = depot;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const pickup = { lat: remaining[i].pickupLat!, lng: remaining[i].pickupLng! };
      const distance = current ? haversineKm(current, pickup) : 0;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    const [chosen] = remaining.splice(bestIndex, 1);
    result.push(chosen);
    current = { lat: chosen.deliveryLat!, lng: chosen.deliveryLng! };
  }

  return result;
}

/**
 * Recomputes stop order (nearest-neighbor) and route distance/duration/geometry
 * for a trip, based on its currently assigned orders. Called after planning,
 * manual order assignment, or a dispatcher drag-and-drop reorder.
 */
export async function resequenceTrip(tripId: string) {
  const trip = await prisma.trip.findUniqueOrThrow({
    where: { id: tripId },
    include: { orders: true, company: true },
  });

  const depot: LatLng | null =
    trip.company.depotLat != null && trip.company.depotLng != null
      ? { lat: trip.company.depotLat, lng: trip.company.depotLng }
      : null;

  const activeOrders = trip.orders.filter(
    (o) => o.status !== "CANCELLED" && o.status !== "FAILED" && o.pickupLat != null && o.pickupLng != null
  );

  const sequenced = sequenceOrdersNearestNeighbor(depot, activeOrders);

  for (let i = 0; i < sequenced.length; i++) {
    await prisma.order.update({ where: { id: sequenced[i].id }, data: { sequence: i } });
  }

  const waypoints: LatLng[] = [];
  if (depot) waypoints.push(depot);
  for (const order of sequenced) {
    waypoints.push({ lat: order.pickupLat!, lng: order.pickupLng! });
    waypoints.push({ lat: order.deliveryLat!, lng: order.deliveryLng! });
  }

  if (waypoints.length >= 2) {
    const route = await computeRoute(waypoints);
    const lastOrder = sequenced.at(-1);
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        distanceKm: route.distanceKm,
        estimatedDurationMin: Math.round(route.durationMin),
        routeGeometry: route.geometry,
        destination: lastOrder ? lastOrder.deliveryAddress : trip.destination,
      },
    });
  }
}

/**
 * Applies a dispatcher-chosen manual order for a trip's stops (drag-and-drop),
 * then recomputes distance/duration/geometry for the new sequence.
 */
export async function reorderTripOrders(tripId: string, orderIdsInOrder: string[]) {
  for (let i = 0; i < orderIdsInOrder.length; i++) {
    await prisma.order.update({ where: { id: orderIdsInOrder[i] }, data: { sequence: i } });
  }

  const trip = await prisma.trip.findUniqueOrThrow({
    where: { id: tripId },
    include: { orders: true, company: true },
  });

  const depot: LatLng | null =
    trip.company.depotLat != null && trip.company.depotLng != null
      ? { lat: trip.company.depotLat, lng: trip.company.depotLng }
      : null;

  const ordered = orderIdsInOrder
    .map((id) => trip.orders.find((o) => o.id === id))
    .filter((o): o is Order => !!o && o.pickupLat != null && o.pickupLng != null);

  const waypoints: LatLng[] = [];
  if (depot) waypoints.push(depot);
  for (const order of ordered) {
    waypoints.push({ lat: order.pickupLat!, lng: order.pickupLng! });
    waypoints.push({ lat: order.deliveryLat!, lng: order.deliveryLng! });
  }

  if (waypoints.length >= 2) {
    const route = await computeRoute(waypoints);
    const lastOrder = ordered.at(-1);
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        distanceKm: route.distanceKm,
        estimatedDurationMin: Math.round(route.durationMin),
        routeGeometry: route.geometry,
        destination: lastOrder ? lastOrder.deliveryAddress : trip.destination,
      },
    });
  }
}
