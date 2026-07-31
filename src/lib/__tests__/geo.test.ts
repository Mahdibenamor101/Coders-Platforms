import { describe, expect, it, vi, afterEach } from "vitest";
import { haversineKm, computeRoute } from "../geo";

describe("haversineKm", () => {
  it("returns 0 for identical points", () => {
    const point = { lat: 33.5945, lng: -7.62 };
    expect(haversineKm(point, point)).toBeCloseTo(0, 5);
  });

  it("computes a realistic distance between Casablanca and Rabat", () => {
    const casablanca = { lat: 33.5731, lng: -7.5898 };
    const rabat = { lat: 34.0209, lng: -6.8416 };
    const distance = haversineKm(casablanca, rabat);
    // Straight-line distance is ~85-95km
    expect(distance).toBeGreaterThan(80);
    expect(distance).toBeLessThan(100);
  });

  it("is symmetric", () => {
    const a = { lat: 33.5731, lng: -7.5898 };
    const b = { lat: 34.0209, lng: -6.8416 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 10);
  });
});

describe("computeRoute", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a zeroed result for fewer than 2 points", async () => {
    const result = await computeRoute([{ lat: 0, lng: 0 }]);
    expect(result).toEqual({ distanceKm: 0, durationMin: 0, geometry: null, source: "estimate" });
  });

  it("falls back to a haversine-based estimate when OSRM is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network unreachable"))
    );

    const casablanca = { lat: 33.5731, lng: -7.5898 };
    const rabat = { lat: 34.0209, lng: -6.8416 };
    const result = await computeRoute([casablanca, rabat]);

    expect(result.source).toBe("estimate");
    expect(result.geometry).toBeNull();
    expect(result.distanceKm).toBeGreaterThan(80);
    expect(result.durationMin).toBeGreaterThan(0);
  });

  it("uses the OSRM response when the request succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          routes: [
            {
              distance: 90000,
              duration: 4800,
              geometry: { coordinates: [[-7.5898, 33.5731], [-6.8416, 34.0209]] },
            },
          ],
        }),
      })
    );

    const result = await computeRoute([
      { lat: 33.5731, lng: -7.5898 },
      { lat: 34.0209, lng: -6.8416 },
    ]);

    expect(result.source).toBe("osrm");
    expect(result.distanceKm).toBe(90);
    expect(result.durationMin).toBe(80);
    expect(result.geometry).not.toBeNull();
  });
});
