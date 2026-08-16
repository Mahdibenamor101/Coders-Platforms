import { NextRequest, NextResponse } from "next/server";
import { startOrder } from "@/lib/driver-portal";

/**
 * POST /api/mobile/driver/orders/<orderId>/start
 * body: { token: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const body = await request.json().catch(() => null);
  const token = body?.token;
  if (typeof token !== "string") {
    return NextResponse.json({ error: "Token requis" }, { status: 400 });
  }

  const result = await startOrder(token, params.orderId);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ order: result.order });
}
