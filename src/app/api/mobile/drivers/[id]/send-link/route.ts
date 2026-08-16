import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const driver = await prisma.driver.findFirst({
    where: { id: params.id, companyId: session.companyId },
  });
  if (!driver) return NextResponse.json({ error: "Chauffeur introuvable" }, { status: 404 });

  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const link = `${baseUrl}/driver/${driver.accessToken}`;

  await sendWhatsAppMessage({
    companyId: session.companyId,
    toPhone: driver.phone,
    body: `Bonjour ${driver.firstName}, voici votre lien personnel LOGISTICS@MAHDI pour suivre vos missions du jour : ${link}`,
    type: "CUSTOM",
    driverId: driver.id,
  });

  return NextResponse.json({ ok: true });
}
