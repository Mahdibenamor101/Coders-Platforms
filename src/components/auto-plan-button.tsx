"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import { runAutoPlanningAction } from "@/lib/actions/order-actions";

export function AutoPlanButton() {
  const [state, formAction] = useFormState(runAutoPlanningAction, undefined);

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <SubmitButton className="btn-primary" pendingText="Planification...">
          Planifier automatiquement
        </SubmitButton>
      </form>
      {state && (
        <div className="card max-w-md p-4 text-sm">
          <p className="font-medium text-slate-800">
            {state.assigned} commande(s) assignee(s) sur {state.routesTouched} tournee(s).
          </p>
          {state.skippedNoCoords > 0 && (
            <p className="mt-1 text-amber-600">
              {state.skippedNoCoords} commande(s) ignoree(s) : adresse non geolocalisee.
            </p>
          )}
          {state.skippedNoCapacity > 0 && (
            <p className="mt-1 text-amber-600">
              {state.skippedNoCapacity} commande(s) ignoree(s) : aucune tournee compatible (competences,
              capacite ou certification ADR).
            </p>
          )}
          {state.messages.map((m, i) => (
            <p key={i} className="mt-1 text-slate-500">{m}</p>
          ))}
        </div>
      )}
    </div>
  );
}
