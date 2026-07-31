import { describe, expect, it } from "vitest";
import { routeCost, improveSequence, sequenceOrdersNearestNeighbor } from "../planning";
import type { Order } from "@prisma/client";

function makeOrder(
  id: string,
  pickup: { lat: number; lng: number },
  delivery: { lat: number; lng: number }
): Order {
  return {
    id,
    pickupLat: pickup.lat,
    pickupLng: pickup.lng,
    deliveryLat: delivery.lat,
    deliveryLng: delivery.lng,
  } as unknown as Order;
}

const DEPOT = { lat: 0, lng: 0 };

const near = makeOrder("near", { lat: 1, lng: 0 }, { lat: 1, lng: 0.1 });
const mid = makeOrder("mid", { lat: 3, lng: 0 }, { lat: 3, lng: 0.1 });
const far = makeOrder("far", { lat: 5, lng: 0 }, { lat: 5, lng: 0.1 });

describe("routeCost", () => {
  it("sums depot-to-pickup, pickup-to-delivery, and delivery-to-next-pickup legs", () => {
    const cost = routeCost(DEPOT, [near]);
    // depot -> pickup (1,0) is ~111km (1 degree latitude), plus a smaller
    // pickup -> delivery leg (0.1 degree longitude) on top of that.
    expect(cost).toBeGreaterThan(115);
    expect(cost).toBeLessThan(130);
  });

  it("returns 0 for an empty order list with no depot", () => {
    expect(routeCost(null, [])).toBe(0);
  });
});

describe("improveSequence", () => {
  it("never makes a route more expensive than the input order", () => {
    const badOrder = [far, near, mid];
    const originalCost = routeCost(DEPOT, badOrder);
    const improved = improveSequence(DEPOT, badOrder);
    const improvedCost = routeCost(DEPOT, improved);

    expect(improvedCost).toBeLessThanOrEqual(originalCost);
  });

  it("fixes an obviously suboptimal (zigzag) order into the near->mid->far order", () => {
    const badOrder = [far, near, mid];
    const improved = improveSequence(DEPOT, badOrder);

    expect(improved.map((o) => o.id)).toEqual(["near", "mid", "far"]);
  });

  it("returns a permutation of the same orders (no duplicates, no drops)", () => {
    const input = [far, near, mid];
    const improved = improveSequence(DEPOT, input);

    expect(improved).toHaveLength(input.length);
    expect(new Set(improved.map((o) => o.id))).toEqual(new Set(input.map((o) => o.id)));
  });

  it("leaves short sequences (fewer than 3 orders) unchanged", () => {
    const input = [far, near];
    expect(improveSequence(DEPOT, input)).toBe(input);
  });
});

describe("sequenceOrdersNearestNeighbor", () => {
  it("visits the closest pickup first from the depot", () => {
    const result = sequenceOrdersNearestNeighbor(DEPOT, [far, mid, near]);
    expect(result[0].id).toBe("near");
    expect(result.at(-1)?.id).toBe("far");
  });
});
