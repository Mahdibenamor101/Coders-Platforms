import { NextRequest, NextResponse } from "next/server";
import { submitProofOfDelivery } from "@/lib/driver-portal";

/**
 * POST /api/mobile/driver/orders/<orderId>/pod
 * multipart/form-data: token, podSignature (base64 data URL), podNotes,
 * podBarcode, photo (file, optional)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const formData = await request.formData();
  const token = formData.get("token");
  if (typeof token !== "string") {
    return NextResponse.json({ error: "Token requis" }, { status: 400 });
  }

  const photo = formData.get("photo");
  const result = await submitProofOfDelivery(token, params.orderId, {
    podSignature: (formData.get("podSignature") as string) ?? "",
    podNotes: (formData.get("podNotes") as string) ?? "",
    podBarcode: (formData.get("podBarcode") as string) ?? "",
    photo: photo instanceof File ? photo : null,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ order: result.order });
}
