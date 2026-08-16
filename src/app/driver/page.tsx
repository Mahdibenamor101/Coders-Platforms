import { MessageCircleQuestion } from "lucide-react";
import { Logo } from "@/components/logo";

export default function DriverPortalHomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm text-center">
        <Logo size={40} textClassName="text-xl" className="mb-6 justify-center" />
        <div className="card space-y-3 p-6">
          <MessageCircleQuestion className="mx-auto h-8 w-8 text-emerald-600" />
          <h1 className="text-lg font-semibold text-slate-900">Lien personnel requis</h1>
          <p className="text-sm text-slate-500">
            Le portail conducteur s&apos;ouvre avec un lien personnel propre à chaque chauffeur.
            Demandez votre lien à votre dispatcher, ou retrouvez-le sur la fiche du chauffeur dans
            l&apos;application (Chauffeurs → votre fiche).
          </p>
        </div>
      </div>
    </div>
  );
}
