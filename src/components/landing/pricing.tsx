"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, Building2, Truck } from "lucide-react";

const PLANS = [
  {
    name: "Decouverte",
    icon: Truck,
    tagline: "Pour tester FleetLink sans engagement",
    price: { monthly: 0, annual: 0 },
    priceSuffix: "",
    cta: "Commencer gratuitement",
    href: "/signup",
    highlighted: false,
    features: [
      "Jusqu'a 2 vehicules",
      "2 chauffeurs",
      "Missions et commandes illimitees",
      "Recommandations de base",
      "WhatsApp simule (mode demo)",
      "1 utilisateur",
    ],
  },
  {
    name: "Croissance",
    icon: Sparkles,
    tagline: "Pour les flottes actives au quotidien",
    price: { monthly: 19, annual: 15 },
    priceSuffix: "/ vehicule / mois",
    cta: "Essayer 14 jours gratuits",
    href: "/signup",
    highlighted: true,
    features: [
      "Vehicules et chauffeurs illimites",
      "WhatsApp Business reel (chauffeurs + clients)",
      "Planification automatique des tournees",
      "Carte live temps reel",
      "Portail conducteur mobile (PWA)",
      "Preuve de livraison + scan code-barres",
      "Avis client",
      "Utilisateurs illimites",
    ],
  },
  {
    name: "Entreprise",
    icon: Building2,
    tagline: "Pour les groupes multi-depots",
    price: { monthly: null, annual: null },
    priceSuffix: "",
    cta: "Contacter l'equipe commerciale",
    href: "/signup",
    highlighted: false,
    features: [
      "Tout Croissance, plus :",
      "Multi-depots et multi-flottes",
      "Support dedie et SLA",
      "Export de donnees & API",
      "Integration ERP / TMS",
      "Accompagnement a la mise en place",
    ],
  },
];

export function LandingPricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="scroll-mt-20 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Tarifs</span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Des prix simples, adaptes a votre flotte
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Commencez gratuitement. Passez au plan superieur quand votre flotte grandit.
          </p>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annual ? "text-slate-900" : "text-slate-400"}`}>
            Mensuel
          </span>
          <button
            type="button"
            onClick={() => setAnnual((v) => !v)}
            className="relative h-7 w-12 rounded-full bg-emerald-600 transition"
            aria-label="Basculer entre facturation mensuelle et annuelle"
          >
            <motion.span
              className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
              animate={{ left: annual ? 26 : 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-slate-900" : "text-slate-400"}`}>
            Annuel <span className="text-emerald-600">(-20%)</span>
          </span>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xl shadow-emerald-600/25 lg:-translate-y-4"
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow">
                  Le plus populaire
                </span>
              )}

              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                  plan.highlighted ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <plan.icon className="h-5 w-5" />
              </div>

              <h3 className={`text-lg font-bold ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                {plan.name}
              </h3>
              <p className={`mt-1 text-sm ${plan.highlighted ? "text-emerald-50" : "text-slate-500"}`}>
                {plan.tagline}
              </p>

              <div className="mt-6">
                {plan.price.monthly === null ? (
                  <span className="text-3xl font-extrabold">Sur devis</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">
                      {annual ? plan.price.annual : plan.price.monthly}€
                    </span>
                    {plan.priceSuffix && (
                      <span
                        className={`text-sm ${plan.highlighted ? "text-emerald-50" : "text-slate-500"}`}
                      >
                        {plan.priceSuffix}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        plan.highlighted ? "text-white" : "text-emerald-600"
                      }`}
                    />
                    <span className={plan.highlighted ? "text-emerald-50" : "text-slate-600"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-white text-emerald-700 hover:bg-emerald-50"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Tarifs indicatifs, adaptables selon vos besoins. Contactez-nous pour une offre sur mesure.
        </p>
      </div>
    </section>
  );
}
