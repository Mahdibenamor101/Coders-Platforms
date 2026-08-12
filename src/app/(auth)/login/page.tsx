"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { loginAction } from "@/lib/actions/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { Logo } from "@/components/logo";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { GoogleErrorBanner } from "@/components/google-error-banner";

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={40} textClassName="text-xl" className="mb-3" />
          <p className="text-sm text-slate-500">
            Gestion logistique de tracteurs & remorques
          </p>
        </div>

        <Suspense fallback={null}>
          <GoogleErrorBanner />
        </Suspense>

        <div className="card space-y-4 p-6">
          <h1 className="text-lg font-semibold text-slate-900">Connexion</h1>

          <GoogleSignInButton />

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            ou
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </div>
            )}
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input className="input" id="email" name="email" type="email" required />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Mot de passe
              </label>
              <input className="input" id="password" name="password" type="password" required />
            </div>
            <SubmitButton pendingText="Connexion...">Se connecter</SubmitButton>
          </form>

          <p className="text-center text-sm text-slate-500">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-medium text-emerald-700 hover:underline">
              Creer une entreprise
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
