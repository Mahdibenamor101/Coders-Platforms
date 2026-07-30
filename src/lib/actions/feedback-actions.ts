"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { feedbackSchema } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth-actions";

export async function submitFeedbackAction(
  token: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const order = await prisma.order.findUnique({ where: { feedbackToken: token } });
  if (!order) return { error: "Commande introuvable." };
  if (order.customerRating) return { error: "Un avis a deja ete enregistre pour cette commande." };

  const parsed = feedbackSchema.safeParse({
    customerRating: formData.get("customerRating"),
    customerFeedback: formData.get("customerFeedback") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Veuillez choisir une note." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      customerRating: parsed.data.customerRating,
      customerFeedback: parsed.data.customerFeedback || null,
      feedbackAt: new Date(),
    },
  });

  revalidatePath(`/feedback/${token}`);
  return { error: undefined };
}
