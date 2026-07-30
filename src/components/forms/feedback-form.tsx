"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import { StarRating } from "@/components/star-rating";
import type { FormState } from "@/lib/actions/auth-actions";

export function FeedbackForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useFormState(action, undefined);

  if (state !== undefined && !state.error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Merci pour votre avis !</p>
        <p className="mt-1 text-sm text-slate-500">Votre retour a bien ete enregistre.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card space-y-4 p-6">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      <div>
        <p className="label">Votre note</p>
        <StarRating name="customerRating" />
      </div>
      <div>
        <label className="label" htmlFor="customerFeedback">Commentaire (optionnel)</label>
        <textarea className="input" id="customerFeedback" name="customerFeedback" rows={3} />
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Envoi...">
        Envoyer mon avis
      </SubmitButton>
    </form>
  );
}
