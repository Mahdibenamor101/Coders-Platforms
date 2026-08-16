import { NextRequest, NextResponse } from "next/server";
import { failOrder } from "@/lib/driver-portal";

/**
 * POST /api/mobile/driver/orders/<orderId>/fail
 * body: { token: string, reason?: string }
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
  const reason = typeof body?.reason === "string" ? body.reason : null;

  const result = await failOrder(token, params.orderId, reason);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ order: result.order });
}
