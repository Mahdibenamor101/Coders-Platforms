import { prisma } from "./prisma";
import { sendWhatsAppMessage } from "./whatsapp";
import type { Order } from "@prisma/client";

const STATUS_MESSAGES: Record<string, (order: Order) => string> = {
  ASSIGNED: (order) =>
    `Bonjour ${order.customerName}, votre commande ${order.reference} a ete prise en charge et sera livree prochainement a : ${order.deliveryAddress}.`,
  IN_PROGRESS: (order) =>
    `Bonjour ${order.customerName}, votre livraison ${order.reference} est en cours de route vers : ${order.deliveryAddress}.`,
  DELIVERED: (order) =>
    `Bonjour ${order.customerName}, votre commande ${order.reference} a ete livree. Merci de votre confiance ! Donnez votre avis : /feedback/${order.feedbackToken}`,
  FAILED: (order) =>
    `Bonjour ${order.customerName}, la livraison de votre commande ${order.reference} n'a pas pu etre effectuee. Notre equipe vous recontactera.`,
};

/**
 * Notifies the customer by WhatsApp of an order status change (ETA/status
 * updates), when the order has a phone number on file. Uses the same
 * simulated-send fallback as driver notifications when no WhatsApp Business
 * credentials are configured.
 */
export async function notifyCustomer(order: Order) {
  if (!order.customerPhone) return;
  const buildMessage = STATUS_MESSAGES[order.status];
  if (!buildMessage) return;

  await sendWhatsAppMessage({
    companyId: order.companyId,
    toPhone: order.customerPhone,
    body: buildMessage(order),
    type: "CUSTOM",
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { customerNotifiedAt: new Date() },
  });
}
