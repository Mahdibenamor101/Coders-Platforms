"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function LandingCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20">
        <div className="blob-anim absolute -top-20 left-10 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
        <div className="blob-anim-slow absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Pret a optimiser votre flotte des aujourd&apos;hui ?
        </h2>
        <p className="mt-4 text-lg text-emerald-50">
          Creez votre compte gratuitement et planifiez votre premiere tournee en quelques minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
          >
            Creer mon compte gratuitement
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Se connecter
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
