"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/actions/auth-actions";

type Option = { id: string; label: string };

export function MaintenanceForm({
  action,
  tractors,
  trailers,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  tractors: Option[];
  trailers: Option[];
}) {
  const [state, formAction] = useFormState(action, undefined);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="tractorId">Tracteur (si applicable)</label>
          <select className="input" id="tractorId" name="tractorId">
            <option value="">Aucun</option>
            {tractors.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="trailerId">Remorque (si applicable)</label>
          <select className="input" id="trailerId" name="trailerId">
            <option value="">Aucune</option>
            {trailers.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="type">Type d&apos;entretien</label>
          <select className="input" id="type" name="type" defaultValue="OTHER">
            <option value="OIL_CHANGE">Vidange</option>
            <option value="TIRES">Pneus</option>
            <option value="BRAKES">Freins</option>
            <option value="INSPECTION">Inspection</option>
            <option value="REPAIR">Reparation</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="performedAt">Date d&apos;intervention</label>
          <input className="input" id="performedAt" name="performedAt" type="date" required />
        </div>
        <div>
          <label className="label" htmlFor="mileage">Kilometrage au moment de l&apos;intervention</label>
          <input className="input" id="mileage" name="mileage" type="number" />
        </div>
        <div>
          <label className="label" htmlFor="cost">Cout (EUR)</label>
          <input className="input" id="cost" name="cost" type="number" step="0.01" />
        </div>
        <div>
          <label className="label" htmlFor="nextDueAt">Prochaine echeance (date)</label>
          <input className="input" id="nextDueAt" name="nextDueAt" type="date" />
        </div>
        <div>
          <label className="label" htmlFor="nextDueMileage">Prochaine echeance (km)</label>
          <input className="input" id="nextDueMileage" name="nextDueMileage" type="number" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="notes">Notes</label>
        <textarea className="input" id="notes" name="notes" rows={3} />
      </div>
      <SubmitButton className="btn-primary" pendingText="Enregistrement...">
        Enregistrer l&apos;entretien
      </SubmitButton>
    </form>
  );
}
