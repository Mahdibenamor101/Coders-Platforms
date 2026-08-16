import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { settingsSchema } from "@/lib/validation";
import { geocodeAddress } from "@/lib/geo";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const company = await prisma.company.findUniqueOrThrow({ where: { id: session.companyId } });
  return NextResponse.json({ company });
}

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const data = parsed.data;

  const current = await prisma.company.findUniqueOrThrow({ where: { id: session.companyId } });
  let depotLat = current.depotLat;
  let depotLng = current.depotLng;

  if (data.depotAddress && data.depotAddress !== current.depotAddress) {
    const geocoded = await geocodeAddress(data.depotAddress);
    depotLat = geocoded?.lat ?? null;
    depotLng = geocoded?.lng ?? null;
  } else if (!data.depotAddress) {
    depotLat = null;
    depotLng = null;
  }

  const company = await prisma.company.update({
    where: { id: session.companyId },
    data: {
      name: data.companyName,
      whatsappPhoneNumberId: data.whatsappPhoneNumberId || null,
      whatsappAccessToken: data.whatsappAccessToken || null,
      whatsappTestRecipient: data.whatsappTestRecipient || null,
      depotAddress: data.depotAddress || null,
      depotLat,
      depotLng,
    },
  });

  return NextResponse.json({ company });
}
