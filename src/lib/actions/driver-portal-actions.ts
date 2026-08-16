"use server";

import { revalidatePath } from "next/cache";
import * as driverPortal from "@/lib/driver-portal";
import type { FormState } from "@/lib/actions/auth-actions";

export async function startOrderAction(token: string, orderId: string) {
  await driverPortal.startOrder(token, orderId);
  revalidatePath(`/driver/${token}`);
}

export async function failOrderAction(token: string, orderId: string, formData: FormData) {
  const reason = (formData.get("reason") as string) || null;
  await driverPortal.failOrder(token, orderId, reason);
  revalidatePath(`/driver/${token}`);
}

export async function submitProofOfDeliveryAction(
  token: string,
  orderId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const photo = formData.get("photo");
  const result = await driverPortal.submitProofOfDelivery(token, orderId, {
    podSignature: (formData.get("podSignature") as string) ?? "",
    podNotes: (formData.get("podNotes") as string) ?? "",
    podBarcode: (formData.get("podBarcode") as string) ?? "",
    photo: photo instanceof File ? photo : null,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath(`/driver/${token}`);
  return { error: undefined };
}
