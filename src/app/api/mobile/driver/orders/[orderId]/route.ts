import { NextRequest, NextResponse } from "next/server";
import { getOrderForDriver } from "@/lib/driver-portal";

/**
 * GET /api/mobile/driver/orders/<orderId>?token=<driver access token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400 });
  }

  const order = await getOrderForDriver(token, params.orderId);
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      id: order.id,
      reference: order.reference,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      hazmat: order.hazmat,
      deliveredAt: order.deliveredAt,
      podNotes: order.podNotes,
    },
  });
}
