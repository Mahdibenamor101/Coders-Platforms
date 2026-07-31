import Link from "next/link";
import { Truck } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 py-12 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <Truck className="h-5 w-5" />
          FleetLink
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <a href="#features" className="hover:text-white">Fonctionnalites</a>
          <a href="#pricing" className="hover:text-white">Tarifs</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
          <Link href="/login" className="hover:text-white">Connexion</Link>
          <Link href="/signup" className="hover:text-white">Essai gratuit</Link>
        </nav>

        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} FleetLink. Tous droits reserves.
        </p>
      </div>
    </footer>
  );
}
