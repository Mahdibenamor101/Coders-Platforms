import { NextRequest, NextResponse } from "next/server";
import { getDriverTrips } from "@/lib/driver-portal";

/**
 * GET /api/mobile/driver/trips?token=<driver access token>
 * Used by the React Native driver app to list the signed-in driver's active
 * trips and their orders/stops.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400 });
  }

  const result = await getDriverTrips(token);
  if (!result) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  const { driver, trips } = result;
  return NextResponse.json({
    driver: {
      id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      phone: driver.phone,
    },
    trips: trips.map((trip) => ({
      id: trip.id,
      status: trip.status,
      origin: trip.origin,
      destination: trip.destination,
      departureAt: trip.departureAt,
      tractor: { plateNumber: trip.tractor.plateNumber },
      trailer: trip.trailer ? { plateNumber: trip.trailer.plateNumber } : null,
      orders: trip.orders.map((order) => ({
        id: order.id,
        reference: order.reference,
        customerName: order.customerName,
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        sequence: order.sequence,
      })),
    })),
  });
}
