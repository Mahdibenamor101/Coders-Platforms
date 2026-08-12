"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { signupAction } from "@/lib/actions/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { Logo } from "@/components/logo";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { GoogleErrorBanner } from "@/components/google-error-banner";

export default function SignupPage() {
  const [state, formAction] = useFormState(signupAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={40} textClassName="text-xl" className="mb-3" />
          <p className="text-sm text-slate-500">Creez votre espace entreprise</p>
        </div>

        <Suspense fallback={null}>
          <GoogleErrorBanner />
        </Suspense>

        <div className="card space-y-4 p-6">
          <h1 className="text-lg font-semibold text-slate-900">Inscription</h1>

          <GoogleSignInButton label="S'inscrire avec Google" />

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
              <label className="label" htmlFor="companyName">
                Nom de l&apos;entreprise
              </label>
              <input className="input" id="companyName" name="companyName" required />
            </div>
            <div>
              <label className="label" htmlFor="name">
                Votre nom
              </label>
              <input className="input" id="name" name="name" required />
            </div>
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
              <input
                className="input"
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
              />
            </div>
            <SubmitButton pendingText="Creation...">Creer mon compte</SubmitButton>
          </form>

          <p className="text-center text-sm text-slate-500">
            Deja inscrit ?{" "}
            <Link href="/login" className="font-medium text-emerald-700 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
