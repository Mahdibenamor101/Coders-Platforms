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
  - missions longues necessitant un rappel de pause reglementaire,
  - **matiere dangereuse assignee a un tracteur non certifie ADR**,
  - **surcharge d'une remorque** (poids total des commandes > capacite).
  Chaque recommandation peut etre envoyee au chauffeur par WhatsApp ou marquee
  comme resolue. Un endpoint `/api/cron/recommendations` permet de rejouer le
  moteur pour toutes les entreprises (a brancher sur un cron, ex. Vercel Cron
  via `vercel.json`).
- **Commandes clients (orders)** : reference, priorite, fenetres horaires,
  competences requises, poids, matiere dangereuse. Adresses geocodees
  automatiquement (OpenStreetMap/Nominatim).
- **Planification automatique des tournees** : moteur heuristique (plus proche
  voisin + insertion gloutonne) qui assigne les commandes en attente aux
  tournees disponibles en respectant les competences des chauffeurs, la
  capacite des remorques et la certification ADR, puis sequence les arrets et
  calcule distance/duree via OSRM (OpenStreetMap). *Ce n'est pas un solveur VRP
  exact (pas d'OR-Tools) — c'est une heuristique gloutonne suffisante pour
  degrossir automatiquement la tournee ; le dispatcher peut ensuite affiner.*
- **Glisser-deposer** : reordonnancement manuel des arrets d'une tournee
  (page Missions), avec recalcul automatique de la distance/duree.
- **Carte live** (Leaflet + OpenStreetMap, sans cle API) : position des
  chauffeurs (relevee automatiquement par le portail conducteur toutes les
  30s) et trace des tournees actives avec ETA.
- **Portail conducteur (PWA web)** : lien personnel par chauffeur
  (`/driver/<token>`), sans compte a creer. Le chauffeur y voit ses tournees et
  arrets du jour, peut demarrer une livraison, capturer une **preuve de
  livraison** (signature tactile, photo, notes) et **scanner un code-barres**
  via la camera du telephone (ZXing). Fonctionne comme une PWA installable
  (manifest + icone) ; pas de service worker hors-ligne pour l'instant.
- **Notifications client automatiques** : le client recoit un WhatsApp a
  l'assignation, au demarrage et a la livraison de sa commande (ou en cas
  d'echec), avec un lien vers la page d'**avis client** (`/feedback/<token>`,
  note 1-5 etoiles + commentaire).

## Stack technique

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Prisma** + SQLite (fichier local, aucune base externe requise pour
  demarrer). Le `datasource` peut etre bascule vers PostgreSQL/MySQL en
  production en changeant `provider` et `DATABASE_URL`.
- **Auth** : JWT (`jose`) + `bcryptjs`, sans dependance externe.
- **WhatsApp** : API Cloud de Meta (`graph.facebook.com`), integration prete a
  l'emploi des que les identifiants sont renseignes dans les Parametres.
- **Cartographie/geocodage** : 100% OpenStreetMap gratuit — Nominatim
  (geocodage d'adresses) et OSRM (calcul d'itineraires, serveur public de
  demonstration), avec repli automatique sur une estimation mathematique
  (haversine) si l'un des services est indisponible. Aucune cle API requise.
  *Limite connue : le serveur OSRM public ne propose pas de profil "poids
  lourd" (pas d'evitement de ponts/tunnels bas ou de restrictions ADR) — pour
  un usage production intensif, remplacer par un fournisseur specialise
  (HERE Truck Routing, PTV, Google Maps Platform avec add-on camion).*
- **Preuve de livraison / scan code-barres** : capture 100% cote client
  (canvas HTML pour la signature, camera via `@zxing/browser` pour les
  codes-barres), pas de service tiers.

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

Le seed cree aussi un depot (Casablanca), des competences/couts par chauffeur
et tracteur, et 3 commandes de demonstration : lancez la planification
automatique depuis la page **Commandes** pour voir le moteur assigner les
tournees. Les liens du **portail conducteur** (`/driver/<token>`) sont
visibles sur la fiche de chaque chauffeur ; un lien d'**avis client**
(`/feedback/<token>`) apparait sur une commande une fois livree.

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
src/lib/                   prisma client, auth, whatsapp, geo, planning, recommandations, validation
src/lib/actions/           server actions (CRUD, whatsapp, commandes, planification, portail conducteur, avis)
src/app/(auth)/            connexion / inscription
src/app/(app)/             application authentifiee (dashboard, tracteurs, commandes, missions, carte live, ...)
src/app/driver/[token]/    portail conducteur public (PWA, sans session dispatcher)
src/app/feedback/[token]/  page publique d'avis client
src/app/api/cron/          endpoint de regeneration des recommandations
src/app/api/driver/        endpoint de remontee de position GPS
```

## Limites connues (pistes d'evolution production)

- Le routage utilise le serveur public OSRM (pas de profil poids lourd / ADR) ;
  a remplacer par un fournisseur specialise pour des restrictions routieres
  reelles (ponts, tunnels, matieres dangereuses).
- La planification automatique est une heuristique gloutonne, pas un solveur
  VRP exact — bon point de depart, affinable manuellement via le
  glisser-deposer.
- Les photos de preuve de livraison sont ecrites sur le disque local
  (`public/uploads/pod`) : a remplacer par un stockage objet (S3, Cloud
  Storage, etc.) pour un deploiement serverless/multi-instance.
- Le portail conducteur est une PWA web (lien + "ajouter a l'ecran d'accueil"),
  sans service worker hors-ligne ; pas de vraie application native iOS/Android.
