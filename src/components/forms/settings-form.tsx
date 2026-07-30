"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import { updateSettingsAction } from "@/lib/actions/settings-actions";

export function SettingsForm({
  defaults,
}: {
  defaults: {
    companyName: string;
    whatsappPhoneNumberId: string;
    whatsappAccessToken: string;
    whatsappTestRecipient: string;
    depotAddress: string;
  };
}) {
  const [state, formAction] = useFormState(updateSettingsAction, undefined);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      {state?.error !== undefined && state.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      {state !== undefined && !state.error && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Parametres enregistres.
        </div>
      )}
      <div>
        <label className="label" htmlFor="companyName">Nom de l&apos;entreprise</label>
        <input className="input" id="companyName" name="companyName" defaultValue={defaults.companyName} required />
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="mb-1 text-sm font-semibold text-slate-800">Depot / point de depart</h3>
        <p className="mb-4 text-xs text-slate-500">
          Adresse utilisee comme point de depart pour la planification automatique des tournees et le
          calcul des itineraires (geocodee automatiquement via OpenStreetMap).
        </p>
        <input
          className="input"
          id="depotAddress"
          name="depotAddress"
          placeholder="Ex : Zone Industrielle, Casablanca, Maroc"
          defaultValue={defaults.depotAddress}
        />
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="mb-1 text-sm font-semibold text-slate-800">WhatsApp Business (Meta Cloud API)</h3>
        <p className="mb-4 text-xs text-slate-500">
          Renseignez le Phone Number ID et le token d&apos;acces de votre application Meta pour envoyer de
          vrais messages WhatsApp. Sans ces informations, les messages sont simules (enregistres mais non
          envoyes) afin que l&apos;application reste utilisable.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="whatsappPhoneNumberId">Phone Number ID</label>
            <input
              className="input"
              id="whatsappPhoneNumberId"
              name="whatsappPhoneNumberId"
              defaultValue={defaults.whatsappPhoneNumberId}
            />
          </div>
          <div>
            <label className="label" htmlFor="whatsappAccessToken">Access Token</label>
            <input
              className="input"
              id="whatsappAccessToken"
              name="whatsappAccessToken"
              type="password"
              defaultValue={defaults.whatsappAccessToken}
            />
          </div>
          <div className="col-span-2">
            <label className="label" htmlFor="whatsappTestRecipient">Numero de test (pour le bouton ci-dessous)</label>
            <input
              className="input"
              id="whatsappTestRecipient"
              name="whatsappTestRecipient"
              placeholder="+33612345678"
              defaultValue={defaults.whatsappTestRecipient}
            />
          </div>
        </div>
      </div>

      <SubmitButton className="btn-primary" pendingText="Enregistrement...">
        Enregistrer les parametres
      </SubmitButton>
    </form>
  );
}
