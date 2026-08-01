import Link from "next/link";
import { Truck, Lock, ShieldCheck } from "lucide-react";

const PRODUCT_LINKS = [
  { label: "Fonctionnalites", href: "#features" },
  { label: "Comment ca marche", href: "#how-it-works" },
  { label: "Tarifs", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const ACCOUNT_LINKS = [
  { label: "Connexion", href: "/login" },
  { label: "Essai gratuit", href: "/signup" },
];

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 text-slate-400">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <Truck className="h-5 w-5" />
              FleetLink
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              La plateforme de gestion logistique pour flottes de tracteurs et remorques.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Produit</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Compte</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Securite</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-500" />
                Paiement chiffre (SSL)
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Donnees hebergees en UE
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} FleetLink. Tous droits reserves.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {["Visa", "Mastercard", "Stripe"].map((method) => (
              <span
                key={method}
                className="rounded-md border border-slate-700 px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-500"
              >
                {method.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
