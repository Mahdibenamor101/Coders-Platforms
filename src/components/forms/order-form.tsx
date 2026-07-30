"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/actions/auth-actions";

type Defaults = {
  reference?: string;
  customerName?: string;
  customerPhone?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  priority?: string;
  requiredSkills?: string | null;
  serviceDurationMin?: number;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  weightKg?: number | null;
  hazmat?: boolean;
};

export function OrderForm({
  action,
  defaults,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: Defaults;
}) {
  const [state, formAction] = useFormState(action, undefined);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="reference">Reference (optionnel)</label>
          <input className="input" id="reference" name="reference" placeholder="Auto-generee si vide" defaultValue={defaults?.reference} />
        </div>
        <div>
          <label className="label" htmlFor="priority">Priorite</label>
          <select className="input" id="priority" name="priority" defaultValue={defaults?.priority ?? "MEDIUM"}>
            <option value="LOW">Basse</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HIGH">Haute</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="customerName">Nom du client</label>
          <input className="input" id="customerName" name="customerName" defaultValue={defaults?.customerName} required />
        </div>
        <div>
          <label className="label" htmlFor="customerPhone">Telephone client (WhatsApp)</label>
          <input className="input" id="customerPhone" name="customerPhone" placeholder="+33612345678" defaultValue={defaults?.customerPhone} />
        </div>
        <div className="col-span-2">
          <label className="label" htmlFor="pickupAddress">Adresse d&apos;enlevement</label>
          <input className="input" id="pickupAddress" name="pickupAddress" defaultValue={defaults?.pickupAddress} required />
        </div>
        <div className="col-span-2">
          <label className="label" htmlFor="deliveryAddress">Adresse de livraison</label>
          <input className="input" id="deliveryAddress" name="deliveryAddress" defaultValue={defaults?.deliveryAddress} required />
        </div>
        <div>
          <label className="label" htmlFor="requiredSkills">Competences requises</label>
          <input
            className="input"
            id="requiredSkills"
            name="requiredSkills"
            placeholder="hayon, adr"
            defaultValue={defaults?.requiredSkills ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="weightKg">Poids (kg)</label>
          <input className="input" id="weightKg" name="weightKg" type="number" defaultValue={defaults?.weightKg ?? undefined} />
        </div>
        <div>
          <label className="label" htmlFor="timeWindowStart">Fenetre horaire - debut</label>
          <input className="input" id="timeWindowStart" name="timeWindowStart" type="datetime-local" defaultValue={defaults?.timeWindowStart} />
        </div>
        <div>
          <label className="label" htmlFor="timeWindowEnd">Fenetre horaire - fin</label>
          <input className="input" id="timeWindowEnd" name="timeWindowEnd" type="datetime-local" defaultValue={defaults?.timeWindowEnd} />
        </div>
        <div>
          <label className="label" htmlFor="serviceDurationMin">Duree d&apos;intervention (min)</label>
          <input
            className="input"
            id="serviceDurationMin"
            name="serviceDurationMin"
            type="number"
            defaultValue={defaults?.serviceDurationMin ?? 15}
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="hazmat" defaultChecked={defaults?.hazmat} className="h-4 w-4 rounded border-slate-300" />
            Matiere dangereuse (necessite un tracteur certifie ADR)
          </label>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Les adresses sont geolocalisees automatiquement via OpenStreetMap pour la planification et la
        carte. Si une adresse est introuvable, la commande reste creable mais ne pourra pas etre
        planifiee automatiquement tant qu&apos;elle n&apos;est pas corrigee.
      </p>
      <SubmitButton className="btn-primary" pendingText="Enregistrement...">
        Enregistrer la commande
      </SubmitButton>
    </form>
  );
}
