"use client";

import { motion } from "framer-motion";
import {
  Truck,
  Users,
  Package,
  Route,
  MapPin,
  MessageCircle,
  Smartphone,
  PenTool,
  Barcode,
  Star,
  Lightbulb,
  Move,
  Wrench,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Truck,
    title: "Tracteurs & remorques",
    description:
      "Immatriculation, kilometrage, assurance, controle technique et statut de chaque vehicule au meme endroit.",
  },
  {
    icon: Users,
    title: "Chauffeurs & competences",
    description:
      "Permis, coordonnees WhatsApp, competences (ADR, hayon...) et cout par km pour une planification realiste.",
  },
  {
    icon: Package,
    title: "Commandes & priorites",
    description:
      "Priorite, fenetres horaires, poids, matiere dangereuse : chaque commande client geolocalisee automatiquement.",
  },
  {
    icon: Route,
    title: "Planification automatique",
    description:
      "Un moteur assigne les commandes aux tournees disponibles selon competences, capacite et certification ADR.",
  },
  {
    icon: MapPin,
    title: "Carte live & ETA",
    description:
      "Position des chauffeurs en temps reel et trace des tournees actives sur OpenStreetMap, sans cle API.",
  },
  {
    icon: MessageCircle,
    title: "Notifications WhatsApp",
    description:
      "Chauffeurs et clients notifies automatiquement : nouvelle mission, depart, livraison, retard.",
  },
  {
    icon: Smartphone,
    title: "Portail conducteur mobile",
    description:
      "Un lien personnel, sans application a installer : le chauffeur voit ses tournees et met a jour son statut.",
  },
  {
    icon: PenTool,
    title: "Preuve de livraison",
    description:
      "Signature tactile, photo et notes capturees directement depuis le telephone du chauffeur.",
  },
  {
    icon: Barcode,
    title: "Scan de codes-barres",
    description:
      "Confirmez une livraison en scannant un colis avec la camera du telephone, aucun materiel dedie requis.",
  },
  {
    icon: Star,
    title: "Avis client",
    description:
      "Chaque client recoit un lien pour noter sa livraison et laisser un commentaire apres reception.",
  },
  {
    icon: Lightbulb,
    title: "Recommandations intelligentes",
    description:
      "Entretiens a prevoir, documents expires, surcharge, matiere dangereuse mal assignee : tout est detecte pour vous.",
  },
  {
    icon: Move,
    title: "Itineraires modifiables",
    description:
      "Reordonnez les arrets d'une tournee par glisser-deposer ; la distance et la duree se recalculent seules.",
  },
  {
    icon: Wrench,
    title: "Entretien & maintenance",
    description:
      "Historique des interventions et prochaines echeances (date ou kilometrage) pour chaque vehicule.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-entreprise securise",
    description:
      "Chaque entreprise dispose de son espace isole, avec authentification et donnees strictement cloisonnees.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="scroll-mt-20 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Fonctionnalites
          </span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Tout ce qu&apos;il faut pour piloter votre logistique
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            De la fiche vehicule a la preuve de livraison, FleetLink couvre l&apos;ensemble du cycle de
            vie d&apos;une tournee.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: (index % 4) * 0.08 }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <feature.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
