"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/actions/auth-actions";

type Defaults = {
  plateNumber?: string;
  type?: string;
  capacityTons?: number | null;
  status?: string;
  nextInspectionDate?: string;
  insuranceExpiry?: string;
  notes?: string | null;
};

export function TrailerForm({
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
          <label className="label" htmlFor="plateNumber">Immatriculation</label>
          <input className="input" id="plateNumber" name="plateNumber" defaultValue={defaults?.plateNumber} required />
        </div>
        <div>
          <label className="label" htmlFor="status">Statut</label>
          <select className="input" id="status" name="status" defaultValue={defaults?.status ?? "AVAILABLE"}>
            <option value="AVAILABLE">Disponible</option>
            <option value="IN_USE">En service</option>
            <option value="MAINTENANCE">En entretien</option>
            <option value="OUT_OF_SERVICE">Hors service</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="type">Type</label>
          <select className="input" id="type" name="type" defaultValue={defaults?.type ?? "CURTAIN"}>
            <option value="CURTAIN">Tautliner / Bache</option>
            <option value="REEFER">Frigorifique</option>
            <option value="FLATBED">Plateau</option>
            <option value="TANK">Citerne</option>
            <option value="CONTAINER">Porte-conteneur</option>
            <option value="TIPPER">Benne</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="capacityTons">Capacite (tonnes)</label>
          <input className="input" id="capacityTons" name="capacityTons" type="number" step="0.1" defaultValue={defaults?.capacityTons ?? undefined} />
        </div>
        <div>
          <label className="label" htmlFor="nextInspectionDate">Prochaine inspection</label>
          <input className="input" id="nextInspectionDate" name="nextInspectionDate" type="date" defaultValue={defaults?.nextInspectionDate} />
        </div>
        <div>
          <label className="label" htmlFor="insuranceExpiry">Expiration assurance</label>
          <input className="input" id="insuranceExpiry" name="insuranceExpiry" type="date" defaultValue={defaults?.insuranceExpiry} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="notes">Notes</label>
        <textarea className="input" id="notes" name="notes" rows={3} defaultValue={defaults?.notes ?? ""} />
      </div>
      <SubmitButton className="btn-primary" pendingText="Enregistrement...">
        Enregistrer
      </SubmitButton>
    </form>
  );
}
