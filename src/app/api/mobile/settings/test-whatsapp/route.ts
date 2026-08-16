import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const company = await prisma.company.findUniqueOrThrow({ where: { id: session.companyId } });
  const recipient = company.whatsappTestRecipient;
  if (!recipient) {
    return NextResponse.json({ error: "Aucun destinataire de test configure." }, { status: 400 });
  }

  await sendWhatsAppMessage({
    companyId: session.companyId,
    toPhone: recipient,
    body: `Message de test LOGISTICS@MAHDI pour ${company.name}. La configuration WhatsApp fonctionne.`,
    type: "CUSTOM",
  });

  return NextResponse.json({ ok: true });
}
