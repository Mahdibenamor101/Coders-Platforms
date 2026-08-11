"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/actions/auth-actions";

type Defaults = {
  plateNumber?: string;
  brand?: string;
  model?: string;
  year?: number | null;
  mileage?: number;
  status?: string;
  nextMaintenanceMileage?: number | null;
  insuranceExpiry?: string;
  technicalControlExpiry?: string;
  notes?: string | null;
  costPerKm?: number | null;
  hazmatCertified?: boolean;
  fuelLevelPercent?: number | null;
  adBlueLevelPercent?: number | null;
};

export function TractorForm({
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
          <label className="label" htmlFor="brand">Marque</label>
          <input className="input" id="brand" name="brand" defaultValue={defaults?.brand} required />
        </div>
        <div>
          <label className="label" htmlFor="model">Modele</label>
          <input className="input" id="model" name="model" defaultValue={defaults?.model} required />
        </div>
        <div>
          <label className="label" htmlFor="year">Annee</label>
          <input className="input" id="year" name="year" type="number" defaultValue={defaults?.year ?? undefined} />
        </div>
        <div>
          <label className="label" htmlFor="mileage">Kilometrage actuel</label>
          <input className="input" id="mileage" name="mileage" type="number" defaultValue={defaults?.mileage ?? 0} required />
        </div>
        <div>
          <label className="label" htmlFor="nextMaintenanceMileage">Prochain entretien (km)</label>
          <input
            className="input"
            id="nextMaintenanceMileage"
            name="nextMaintenanceMileage"
            type="number"
            defaultValue={defaults?.nextMaintenanceMileage ?? undefined}
          />
        </div>
        <div>
          <label className="label" htmlFor="insuranceExpiry">Expiration assurance</label>
          <input className="input" id="insuranceExpiry" name="insuranceExpiry" type="date" defaultValue={defaults?.insuranceExpiry} />
        </div>
        <div>
          <label className="label" htmlFor="technicalControlExpiry">Expiration controle technique</label>
          <input
            className="input"
            id="technicalControlExpiry"
            name="technicalControlExpiry"
            type="date"
            defaultValue={defaults?.technicalControlExpiry}
          />
        </div>
        <div>
          <label className="label" htmlFor="costPerKm">Cout par km (pour la planification)</label>
          <input className="input" id="costPerKm" name="costPerKm" type="number" step="0.01" defaultValue={defaults?.costPerKm ?? undefined} />
        </div>
        <div>
          <label className="label" htmlFor="fuelLevelPercent">Niveau de gasoil (%)</label>
          <input
            className="input"
            id="fuelLevelPercent"
            name="fuelLevelPercent"
            type="number"
            min={0}
            max={100}
            defaultValue={defaults?.fuelLevelPercent ?? undefined}
          />
        </div>
        <div>
          <label className="label" htmlFor="adBlueLevelPercent">Niveau AdBlue (%)</label>
          <input
            className="input"
            id="adBlueLevelPercent"
            name="adBlueLevelPercent"
            type="number"
            min={0}
            max={100}
            defaultValue={defaults?.adBlueLevelPercent ?? undefined}
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="hazmatCertified"
              defaultChecked={defaults?.hazmatCertified}
              className="h-4 w-4 rounded border-slate-300"
            />
            Certifie matieres dangereuses (ADR)
          </label>
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
