"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";

const PAYMENT_METHODS = ["Visa", "Mastercard", "Stripe", "American Express"];

const ASSURANCES = [
  { icon: Lock, label: "Paiement chiffre (SSL)" },
  { icon: ShieldCheck, label: "Donnees hebergees en UE" },
  { icon: CreditCard, label: "Sans engagement, resiliable a tout moment" },
];

export function LandingTrustBadges() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5 }}
      className="mx-auto mt-14 flex max-w-4xl flex-col items-center gap-6"
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        {PAYMENT_METHODS.map((method) => (
          <span
            key={method}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold tracking-wide text-slate-400"
          >
            {method.toUpperCase()}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-500">
        {ASSURANCES.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-emerald-600" />
            {label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
