import { prisma } from "./prisma";
import type { WhatsAppMessageType } from "./enums";

type Credentials = {
  phoneNumberId: string;
  accessToken: string;
};

type SendParams = {
  companyId: string;
  toPhone: string;
  body: string;
  type: WhatsAppMessageType;
  driverId?: string;
};

function getCompanyCredentials(company: {
  whatsappPhoneNumberId: string | null;
  whatsappAccessToken: string | null;
}): Credentials | null {
  if (company.whatsappPhoneNumberId && company.whatsappAccessToken) {
    return {
      phoneNumberId: company.whatsappPhoneNumberId,
      accessToken: company.whatsappAccessToken,
    };
  }
  const defaultPhoneId = process.env.WHATSAPP_DEFAULT_PHONE_NUMBER_ID;
  const defaultToken = process.env.WHATSAPP_DEFAULT_ACCESS_TOKEN;
  if (defaultPhoneId && defaultToken) {
    return { phoneNumberId: defaultPhoneId, accessToken: defaultToken };
  }
  return null;
}

/** Normalizes a phone number to the digits-only format the Meta Graph API expects. */
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

/**
 * Sends a WhatsApp message to a driver (or any recipient) via the Meta Cloud API.
 * If the company has no WhatsApp credentials configured (and no platform-level
 * default is set), the message is simulated: it is logged to the database with
 * status SIMULATED so the rest of the app keeps working without a live
 * WhatsApp Business account.
 */
export async function sendWhatsAppMessage(params: SendParams) {
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: params.companyId },
    select: { whatsappPhoneNumberId: true, whatsappAccessToken: true },
  });

  const credentials = getCompanyCredentials(company);
  const toPhone = normalizePhone(params.toPhone);

  if (!credentials) {
    return prisma.whatsAppMessage.create({
      data: {
        companyId: params.companyId,
        driverId: params.driverId,
        toPhone,
        type: params.type,
        body: params.body,
        status: "SIMULATED",
        errorMessage: "No WhatsApp Business credentials configured for this company.",
      },
    });
  }

  const apiVersion = process.env.WHATSAPP_API_VERSION || "v20.0";
  const url = `https://graph.facebook.com/${apiVersion}/${credentials.phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toPhone,
        type: "text",
        text: { body: params.body },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data?.error?.message || `WhatsApp API responded with status ${response.status}`;
      return prisma.whatsAppMessage.create({
        data: {
          companyId: params.companyId,
          driverId: params.driverId,
          toPhone,
          type: params.type,
          body: params.body,
          status: "FAILED",
          errorMessage,
        },
      });
    }

    const providerMessageId = data?.messages?.[0]?.id ?? null;

    return prisma.whatsAppMessage.create({
      data: {
        companyId: params.companyId,
        driverId: params.driverId,
        toPhone,
        type: params.type,
        body: params.body,
        status: "SENT",
        providerMessageId,
      },
    });
  } catch (error) {
    return prisma.whatsAppMessage.create({
      data: {
        companyId: params.companyId,
        driverId: params.driverId,
        toPhone,
        type: params.type,
        body: params.body,
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}

export function buildTripAssignmentMessage(params: {
  driverFirstName: string;
  origin: string;
  destination: string;
  departureAt: Date;
  tractorPlate: string;
  trailerPlate?: string | null;
  cargoDescription?: string | null;
}) {
  const departure = params.departureAt.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const lines = [
    `Bonjour ${params.driverFirstName}, une nouvelle mission vous a ete assignee.`,
    `Trajet : ${params.origin} -> ${params.destination}`,
    `Depart prevu : ${departure}`,
    `Tracteur : ${params.tractorPlate}`,
  ];
  if (params.trailerPlate) lines.push(`Remorque : ${params.trailerPlate}`);
  if (params.cargoDescription) lines.push(`Marchandise : ${params.cargoDescription}`);
  lines.push("Merci de confirmer la bonne reception de ce message.");
  return lines.join("\n");
}
