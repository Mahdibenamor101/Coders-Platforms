"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/actions/auth-actions";

type Defaults = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  status?: string;
  hireDate?: string;
  notes?: string | null;
};

export function DriverForm({
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
          <label className="label" htmlFor="firstName">Prenom</label>
          <input className="input" id="firstName" name="firstName" defaultValue={defaults?.firstName} required />
        </div>
        <div>
          <label className="label" htmlFor="lastName">Nom</label>
          <input className="input" id="lastName" name="lastName" defaultValue={defaults?.lastName} required />
        </div>
        <div>
          <label className="label" htmlFor="phone">Telephone (WhatsApp, format international)</label>
          <input className="input" id="phone" name="phone" placeholder="+33612345678" defaultValue={defaults?.phone} required />
        </div>
        <div>
          <label className="label" htmlFor="status">Statut</label>
          <select className="input" id="status" name="status" defaultValue={defaults?.status ?? "ACTIVE"}>
            <option value="ACTIVE">Actif</option>
            <option value="ON_LEAVE">En conge</option>
            <option value="SUSPENDED">Suspendu</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="licenseNumber">Numero de permis</label>
          <input className="input" id="licenseNumber" name="licenseNumber" defaultValue={defaults?.licenseNumber} required />
        </div>
        <div>
          <label className="label" htmlFor="licenseExpiry">Expiration du permis</label>
          <input className="input" id="licenseExpiry" name="licenseExpiry" type="date" defaultValue={defaults?.licenseExpiry} required />
        </div>
        <div>
          <label className="label" htmlFor="hireDate">Date d&apos;embauche</label>
          <input className="input" id="hireDate" name="hireDate" type="date" defaultValue={defaults?.hireDate} />
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
