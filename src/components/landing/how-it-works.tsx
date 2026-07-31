"use client";

import { motion } from "framer-motion";
import { UserPlus, Truck, Route, MapPin } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Creez votre compte",
    description: "Inscrivez votre entreprise en quelques minutes, sans carte bancaire.",
  },
  {
    icon: Truck,
    title: "Ajoutez votre flotte",
    description: "Tracteurs, remorques et chauffeurs, avec leurs competences et documents.",
  },
  {
    icon: Route,
    title: "Planifiez vos tournees",
    description: "Creez des commandes et laissez le moteur les assigner automatiquement.",
  },
  {
    icon: MapPin,
    title: "Suivez en temps reel",
    description: "Carte live, WhatsApp et recommandations pour garder le controle.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Comment ca marche
          </span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Operationnel en quatre etapes
          </h2>
        </motion.div>

        <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent lg:block"
          />
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600 shadow-sm">
                <step.icon className="h-7 w-7" strokeWidth={2} />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-base font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-slate-500">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
