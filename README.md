# LOGISTICS@MAHDI

SaaS de gestion logistique pour tracteurs et remorques : suivi de flotte,
missions, entretien, notifications WhatsApp aux chauffeurs et recommandations
intelligentes generees automatiquement.

## Fonctionnalites

- **Page d'accueil / landing page** (`/`) : presentation publique du produit
  (animations Framer Motion), fonctionnalites, tarifs (3 offres) et FAQ. Visible
  uniquement par les visiteurs non connectes ; redirige vers le tableau de bord
  si une session est active.
- **Multi-entreprise (SaaS)** : chaque entreprise inscrite dispose de son propre
  espace isole (tracteurs, remorques, chauffeurs, missions, parametres).
- **Authentification** : inscription / connexion par email + mot de passe
  (session JWT en cookie httpOnly).
- **Tracteurs** : immatriculation, kilometrage, statut, assurance, controle
  technique, historique d'entretien, **niveaux de gasoil et d'AdBlue** (saisis
  manuellement, avec recommandation automatique en dessous de 20%/15%).
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
- **Position GPS materielle des vehicules** : chaque tracteur/remorque a un
  token dedie et une URL de webhook (`/api/gps/<token>/position`, visible sur
  sa fiche) a configurer sur un vrai boitier GPS (Teltonika, Geotab, ou tout
  materiel capable d'appeler une URL HTTP). Independant de la position du
  telephone du chauffeur ; affiche sur la carte live avec une icone distincte.
- **Dashcam** : pendant une mission en cours, le chauffeur peut lancer
  l'enregistrement video depuis son telephone (portail conducteur). Les
  segments (2 min) sont uploades au fur et a mesure et visibles sur la fiche
  de la mission (lecture + telechargement). *Limite connue : l'enregistrement
  necessite que l'onglet du navigateur reste ouvert et au premier plan
  (les navigateurs mobiles suspendent l'enregistrement en arriere-plan/ecran
  verrouille) ; consomme des donnees mobiles et du stockage.* Les segments
  non telecharges sont supprimes automatiquement au bout de 3 jours
  (`/api/cron/dashcam-cleanup`).
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
- **Framer Motion** + **lucide-react** pour les animations et icones de la
  page d'accueil publique.
- **Prisma** + **PostgreSQL** (necessite une instance locale ou distante, voir
  "Demarrage").
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

Necessite une base Postgres accessible localement (par ex. via Docker :
`docker run --name fleetlink-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`).

```bash
npm install
cp .env.example .env      # renseigner DATABASE_URL et generer un AUTH_SECRET
npm run db:push           # synchronise le schema Prisma avec la base
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

## Connexion avec Google (optionnel)

Le bouton **Continuer avec Google** sur les pages de connexion/inscription
fonctionne des que ces deux variables d'environnement sont renseignees ;
sans elles, le bouton affiche un message d'erreur clair au lieu de planter.

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   et creez (ou selectionnez) un projet.
2. **OAuth consent screen** : configurez l'ecran de consentement (type
   "External" pour un usage public), avec le nom de l'application
   (`LOGISTICS@MAHDI`) et votre email de contact.
3. **Credentials → Create Credentials → OAuth client ID**, type
   **Web application**.
4. Sous **Authorized redirect URIs**, ajoutez :
   - `http://localhost:3000/api/auth/google/callback` (developpement local)
   - `https://votre-domaine.com/api/auth/google/callback` (production)
5. Copiez le **Client ID** et le **Client Secret** generes dans `.env` :
   ```
   GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="...."
   ```
6. En production (Vercel/Railway/...), ajoutez ces memes variables dans les
   parametres d'environnement du projet, avec l'URI de redirection de
   production ajoutee a l'etape 4.

Premiere connexion via Google : si l'email n'existe pas encore, une nouvelle
entreprise est creee automatiquement (compte administrateur). Si l'email
correspond a un compte existant (cree par email/mot de passe), le compte
Google est simplement associe a ce compte au lieu d'en creer un nouveau.

## Deploiement en production (Vercel)

1. **Poussez le repo sur GitHub** (deja fait si vous travaillez depuis cette
   branche), puis importez le projet sur [vercel.com](https://vercel.com) →
   *Add New → Project* → selectionnez le repo.
2. **Base de donnees Postgres** — creez-en une avant le premier deploiement :
   - *Option simple* : dans le dashboard Vercel du projet, onglet **Storage**
     → **Create Database** → **Postgres** (Neon). Vercel ajoute
     automatiquement les variables `DATABASE_URL` (et alias) au projet.
   - *Alternative* : un compte gratuit chez [Neon](https://neon.tech) ou
     [Supabase](https://supabase.com) fonctionne aussi ; copiez la chaine de
     connexion fournie dans `DATABASE_URL`.
3. **Variables d'environnement** (onglet **Settings → Environment
   Variables** du projet Vercel) :
   - `DATABASE_URL` — chaine de connexion Postgres (etape precedente).
   - `AUTH_SECRET` — chaine aleatoire longue, par ex. generee avec
     `openssl rand -hex 32`.
   - `APP_URL` — l'URL publique de votre deploiement (ex.
     `https://votre-app.vercel.app`), utilisee dans les liens WhatsApp/SMS
     envoyes aux chauffeurs et clients.
   - `BLOB_READ_WRITE_TOKEN` — creez un store dans l'onglet **Storage** →
     **Create Database** → **Blob**, puis copiez le token genere. Necessaire
     pour que les photos de preuve de livraison et les videos dashcam
     persistent (le disque local n'est pas fiable en serverless) ; sans ce
     token, l'app fonctionne mais revient au stockage disque local (non
     persistant en production).
   - `WHATSAPP_DEFAULT_PHONE_NUMBER_ID` / `WHATSAPP_DEFAULT_ACCESS_TOKEN` —
     optionnel, seulement si vous voulez des valeurs par defaut au niveau
     plateforme (chaque entreprise peut aussi configurer les siennes dans
     **Parametres**).
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optionnel, pour activer
     "Continuer avec Google" (voir section dediee plus haut). N'oubliez pas
     d'ajouter `https://votre-domaine/api/auth/google/callback` aux URI de
     redirection autorisees dans Google Cloud Console.
4. **Premier deploiement** : cliquez **Deploy**. Vercel installe les
   dependances (`postinstall` lance `prisma generate` automatiquement) et
   build l'application.
5. **Synchronisez le schema sur la base de production** (une fois, puis a
   chaque evolution du schema) depuis votre machine :
   ```bash
   DATABASE_URL="<chaine de connexion production>" npx prisma db push
   ```
6. Les crons (`vercel.json`) — recommandations (`/api/cron/recommendations`,
   6h) et nettoyage des videos dashcam (`/api/cron/dashcam-cleanup`, 3h) —
   sont actifs automatiquement sur les projets Vercel Pro ; sur le plan
   Hobby, appelez-les manuellement ou via un service cron externe.

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
- Les photos de preuve de livraison utilisent Vercel Blob en production
  (variable `BLOB_READ_WRITE_TOKEN`) et retombent sur le disque local
  (`public/uploads/pod`) si elle est absente — pratique en local, mais non
  persistant en serverless.
- Le portail conducteur est une PWA web (lien + "ajouter a l'ecran d'accueil"),
  sans service worker hors-ligne ; pas de vraie application native iOS/Android.
- Le schema Prisma est synchronise avec `prisma db push` (pas de vraies
  migrations versionnees) : suffisant pour ce stade du projet, mais a
  remplacer par `prisma migrate` avant d'avoir de vraies donnees clients en
  production.
- Le rate limiting (connexion/inscription) est en memoire, par instance : il
  ralentit le brute force sur un seul serveur mais ne partage pas l'etat entre
  plusieurs instances serverless. A remplacer par un store partage (Redis,
  Upstash) si le trafic le justifie.
- La position GPS des vehicules (tracteurs/remorques) n'est disponible que si
  un boitier GPS physique est installe et configure pour appeler le webhook
  `/api/gps/<token>/position` — sans materiel, seule la position du telephone
  du chauffeur (portail conducteur) est disponible.
- L'enregistrement dashcam utilise la camera du telephone via le navigateur
  (pas de vrai boitier dashcam) : il s'arrete si l'ecran se verrouille ou si
  l'onglet passe en arriere-plan (limite des navigateurs mobiles), et
  consomme des donnees mobiles + du stockage cloud.
