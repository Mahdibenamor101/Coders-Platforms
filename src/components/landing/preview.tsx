"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { key: "dashboard", label: "Tableau de bord", src: "/screenshots/dashboard.png", path: "/dashboard" },
  { key: "orders", label: "Commandes", src: "/screenshots/orders.png", path: "/orders" },
  {
    key: "recommendations",
    label: "Recommandations",
    src: "/screenshots/recommendations.png",
    path: "/recommendations",
  },
];

export function LandingPreview() {
  const [active, setActive] = useState(TABS[0].key);
  const current = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <section id="preview" className="scroll-mt-20 bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Apercu</span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Decouvrez l&apos;application en images
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            De vraies captures d&apos;ecran de FleetLink, telles que vos dispatchers et vos chauffeurs
            les verront.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_300px]"
        >
          <div>
            <div className="mb-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActive(tab.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    active === tab.key
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 rounded bg-white px-3 py-1 text-xs text-slate-400">
                  app.fleetlink.com{current.path}
                </span>
              </div>
              <div className="relative aspect-[1280/800] w-full bg-slate-50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={current.src}
                      alt={current.label}
                      fill
                      sizes="(min-width: 1024px) 60vw, 90vw"
                      className="object-cover object-top"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[260px]">
            <p className="mb-4 text-center text-sm font-medium text-slate-500 lg:text-left">
              Portail conducteur (mobile)
            </p>
            <div className="rounded-[2rem] border-8 border-slate-900 bg-slate-900 shadow-2xl">
              <div className="relative aspect-[430/780] w-full overflow-hidden rounded-[1.3rem] bg-white">
                <Image
                  src="/screenshots/driver-portal.png"
                  alt="Portail conducteur mobile FleetLink"
                  fill
                  sizes="260px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
