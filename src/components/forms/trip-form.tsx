"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/actions/auth-actions";

type Option = { id: string; label: string };

export function TripForm({
  action,
  tractors,
  trailers,
  drivers,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  tractors: Option[];
  trailers: Option[];
  drivers: Option[];
}) {
  const [state, formAction] = useFormState(action, undefined);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="tractorId">Tracteur</label>
          <select className="input" id="tractorId" name="tractorId" required>
            <option value="">Selectionner...</option>
            {tractors.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="trailerId">Remorque (optionnel)</label>
          <select className="input" id="trailerId" name="trailerId">
            <option value="">Aucune</option>
            {trailers.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="driverId">Chauffeur</label>
          <select className="input" id="driverId" name="driverId" required>
            <option value="">Selectionner...</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="distanceKm">Distance (km)</label>
          <input className="input" id="distanceKm" name="distanceKm" type="number" step="0.1" />
        </div>
        <div>
          <label className="label" htmlFor="origin">Origine</label>
          <input className="input" id="origin" name="origin" required />
        </div>
        <div>
          <label className="label" htmlFor="destination">Destination</label>
          <input className="input" id="destination" name="destination" required />
        </div>
        <div>
          <label className="label" htmlFor="departureAt">Depart prevu</label>
          <input className="input" id="departureAt" name="departureAt" type="datetime-local" required />
        </div>
        <div>
          <label className="label" htmlFor="estimatedArrivalAt">Arrivee estimee</label>
          <input className="input" id="estimatedArrivalAt" name="estimatedArrivalAt" type="datetime-local" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="cargoDescription">Marchandise</label>
        <textarea className="input" id="cargoDescription" name="cargoDescription" rows={2} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="notifyDriver" defaultChecked className="h-4 w-4 rounded border-slate-300" />
        Notifier le chauffeur par WhatsApp des la creation
      </label>
      <SubmitButton className="btn-primary" pendingText="Creation...">
        Creer la mission
      </SubmitButton>
    </form>
  );
}
