"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import { SignaturePad } from "@/components/signature-pad";
import { BarcodeScanner } from "@/components/barcode-scanner";
import type { FormState } from "@/lib/actions/auth-actions";

export function PodForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useFormState(action, undefined);
  const [barcode, setBarcode] = useState("");

  return (
    <form action={formAction} className="card space-y-4 p-4">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      <div>
        <p className="label">Signature du client</p>
        <SignaturePad name="podSignature" />
      </div>
      <div>
        <p className="label">Photo de livraison</p>
        <input
          type="file"
          name="photo"
          accept="image/*"
          capture="environment"
          className="block w-full text-sm"
        />
      </div>
      <div>
        <p className="label">Code-barres</p>
        <BarcodeScanner onDetected={setBarcode} />
        <input
          className="input mt-2"
          name="podBarcode"
          placeholder="Ou saisir manuellement"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="podNotes">Notes</label>
        <textarea className="input" id="podNotes" name="podNotes" rows={2} />
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Envoi...">
        Confirmer la livraison
      </SubmitButton>
    </form>
  );
}
