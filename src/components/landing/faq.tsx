"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const QUESTIONS = [
  {
    question: "Ai-je besoin d'un compte WhatsApp Business pour commencer ?",
    answer:
      "Non. Sans configuration, FleetLink simule les envois WhatsApp (ils sont journalises mais non delivres) afin que vous puissiez tester toute l'application. Vous pouvez brancher un vrai compte WhatsApp Business (Meta Cloud API) a tout moment depuis les Parametres.",
  },
  {
    question: "La planification automatique remplace-t-elle un dispatcher ?",
    answer:
      "Non, elle le decharge des taches repetitives. Le moteur propose une premiere affectation des commandes en respectant competences, capacite et certification ADR ; le dispatcher garde la main pour ajuster les tournees par glisser-deposer.",
  },
  {
    question: "Puis-je changer de plan a tout moment ?",
    answer:
      "Oui, vous pouvez passer du plan Decouverte au plan Croissance (ou inversement) a tout moment depuis votre espace. Aucun engagement de duree sur le plan mensuel.",
  },
  {
    question: "Le portail conducteur necessite-t-il d'installer une application ?",
    answer:
      "Non. Chaque chauffeur recoit un lien personnel qu'il ouvre dans le navigateur de son telephone. Il peut l'ajouter a son ecran d'accueil pour un acces rapide, sans passer par un store d'applications.",
  },
  {
    question: "Mes donnees sont-elles isolees de celles des autres entreprises ?",
    answer:
      "Oui. FleetLink est concu en multi-entreprise : chaque entreprise dispose de son propre espace et de ses propres donnees, strictement cloisonnees et accessibles uniquement a ses utilisateurs authentifies.",
  },
  {
    question: "La carte et les itineraires utilisent-ils une cle Google Maps payante ?",
    answer:
      "Non. FleetLink s'appuie sur OpenStreetMap (cartes, geocodage et calcul d'itineraires), sans cle API ni cout supplementaire. Une integration avec un fournisseur specialise (routage poids lourd, matieres dangereuses) est possible sur le plan Entreprise.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">FAQ</span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Questions frequentes</h2>
        </motion.div>

        <div className="mt-12 space-y-3">
          {QUESTIONS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-slate-900">{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
