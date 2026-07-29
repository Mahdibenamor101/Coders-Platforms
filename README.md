# FleetLink

SaaS de gestion logistique pour tracteurs et remorques : suivi de flotte,
missions, entretien, notifications WhatsApp aux chauffeurs et recommandations
intelligentes generees automatiquement.

## Fonctionnalites

- **Multi-entreprise (SaaS)** : chaque entreprise inscrite dispose de son propre
  espace isole (tracteurs, remorques, chauffeurs, missions, parametres).
- **Authentification** : inscription / connexion par email + mot de passe
  (session JWT en cookie httpOnly).
- **Tracteurs** : immatriculation, kilometrage, statut, assurance, controle
  technique, historique d'entretien.
- **Remorques** : type (tautliner, frigorifique, plateau, citerne, ...),
  capacite, statut, inspections.
- **Chauffeurs** : coordonnees WhatsApp, permis de conduire, statut.
- **Missions (trips)** : assignation tracteur + remorque + chauffeur,
  origine/destination, dates, suivi du statut (planifiee, en cours, terminee,
  annulee).
- **Entretien** : historique des interventions (vidange, pneus, freins,
  inspection, reparation) avec prochaines echeances (date et/ou kilometrage).
- **Notifications WhatsApp** : a l'assignation d'une mission (ou a la demande),
  le chauffeur recoit un message via l'API WhatsApp Business (Meta Cloud API).
  Sans identifiants configures, les envois sont **simules** (enregistres en
  base avec le statut `SIMULATED`) afin que l'application reste pleinement
  utilisable en demonstration.
- **Recommandations intelligentes** : moteur de regles qui detecte
  automatiquement :
  - entretiens de tracteurs a prevoir / en retard (par kilometrage),
  - documents bientot expires ou expires (permis, assurance, controle
    technique, inspection remorque),
  - missions dont le chauffeur n'a pas encore ete notifie,
  - missions longues necessitant un rappel de pause reglementaire.
  Chaque recommandation peut etre envoyee au chauffeur par WhatsApp ou marquee
  comme resolue. Un endpoint `/api/cron/recommendations` permet de rejouer le
  moteur pour toutes les entreprises (a brancher sur un cron, ex. Vercel Cron
  via `vercel.json`).

## Stack technique

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Prisma** + SQLite (fichier local, aucune base externe requise pour
  demarrer). Le `datasource` peut etre bascule vers PostgreSQL/MySQL en
  production en changeant `provider` et `DATABASE_URL`.
- **Auth** : JWT (`jose`) + `bcryptjs`, sans dependance externe.
- **WhatsApp** : API Cloud de Meta (`graph.facebook.com`), integration prete a
  l'emploi des que les identifiants sont renseignes dans les Parametres.

## Demarrage

```bash
npm install
cp .env.example .env      # ajuster AUTH_SECRET en production
npm run db:push           # cree prisma/dev.db a partir du schema
npm run db:seed           # jeu de donnees de demonstration
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

Compte de demonstration cree par le seed :

- email : `demo@fleetlink.app`
- mot de passe : `password123`

## Configuration WhatsApp (optionnel)

Dans **Parametres**, renseignez le `Phone Number ID` et l'`Access Token` de
votre application Meta WhatsApp Business (Meta for Developers). Vous pouvez
aussi definir des valeurs par defaut au niveau plateforme via les variables
d'environnement `WHATSAPP_DEFAULT_PHONE_NUMBER_ID` et
`WHATSAPP_DEFAULT_ACCESS_TOKEN`. Sans configuration, tous les envois sont
simules et journalises (visible dans le journal des messages, page
Parametres) afin de ne jamais bloquer l'utilisation de l'application.

## Scripts utiles

- `npm run dev` — serveur de developpement
- `npm run build` / `npm run start` — build et lancement production
- `npm run db:push` — synchronise le schema Prisma avec la base
- `npm run db:seed` — recharge les donnees de demonstration
- `npm run recommendations:run` — rejoue le moteur de recommandations pour
  toutes les entreprises (equivalent CLI de `/api/cron/recommendations`)

## Structure du projet

```
prisma/schema.prisma       modeles de donnees (multi-tenant)
prisma/seed.ts             donnees de demonstration
src/lib/                   prisma client, auth, whatsapp, recommandations, validation
src/lib/actions/           server actions (CRUD, whatsapp, recommandations)
src/app/(auth)/            connexion / inscription
src/app/(app)/             application authentifiee (dashboard, tracteurs, ...)
src/app/api/cron/          endpoint de regeneration des recommandations
```
