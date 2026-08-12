"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, MapPin, Truck } from "lucide-react";

const badges = ["Sans carte bancaire", "Configuration en 5 minutes", "100% en francais"];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white pt-32 pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="bg-dot-grid absolute inset-0"
          style={{ maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 90%)" }}
        />
        <div className="blob-anim absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="blob-anim-slow absolute top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700"
          >
            <Truck className="h-3.5 w-3.5" />
            Gestion de flotte tracteurs &amp; remorques
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Pilotez votre flotte,{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              pas vos tableurs
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg text-slate-600"
          >
            LOGISTICS@MAHDI centralise vos tracteurs, remorques et chauffeurs, planifie vos tournees
            automatiquement, notifie vos chauffeurs et vos clients par WhatsApp, et vous alerte avant
            que les problemes n&apos;arrivent.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              Creer mon compte gratuitement
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Voir les fonctionnalites
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500"
          >
            {badges.map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {b}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="float-anim rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/40">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">Tableau de bord</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                En direct
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tracteurs", value: "12" },
                { label: "Missions actives", value: "8" },
                { label: "Chauffeurs", value: "15" },
                { label: "Recommandations", value: "3" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3">
                <MapPin className="h-4 w-4 shrink-0 text-blue-600" />
                <div className="text-xs">
                  <p className="font-medium text-slate-800">Casablanca → Marrakech</p>
                  <p className="text-slate-500">ETA 2h14 - en route</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <div className="text-xs">
                  <p className="font-medium text-slate-800">WhatsApp envoye a Karim</p>
                  <p className="text-slate-500">Nouvelle mission assignee</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="float-anim-delayed absolute -bottom-6 -left-8 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:block"
          >
            <p className="text-xs font-semibold text-slate-800">Preuve de livraison</p>
            <p className="text-xs text-slate-500">Signature + photo confirmees</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
