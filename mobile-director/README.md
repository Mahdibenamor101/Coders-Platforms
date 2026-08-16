# LOGISTICS@MAHDI — App Direction (React Native / Expo)

Application native (Android/iOS) pour le directeur/dispatcher : tableau de
bord, tracteurs, remorques, chauffeurs, commandes, tournées (avec
planification automatique), carte live, maintenance, recommandations et
paramètres. Elle consomme les routes JSON `/api/mobile/*` avec une
authentification par JWT bearer (email + mot de passe, comme la connexion
web).

## Lancer en local

1. Démarrer le serveur Next.js (`npm run dev` à la racine du dépôt).
2. Dans ce dossier :
   ```
   npm install
   npx expo start
   ```
3. Scanner le QR code avec **Expo Go**, ou générer un APK installable avec
   `npx expo run:android` (voir `mobile-driver/README.md` pour le guide
   Windows détaillé — la procédure JAVA_HOME/ANDROID_HOME est identique).
4. Sur l'écran de connexion, saisir :
   - **Adresse du serveur** : l'URL du backend (ex. `http://10.0.2.2:3000`
     depuis un émulateur Android pour joindre le PC hôte, ou l'URL du
     tunnel ngrok/cloudflared pour un téléphone physique).
   - **Email / mot de passe** : les identifiants du compte directeur
     existant (les mêmes que pour se connecter sur le site web).

## Structure

- `src/api/client.ts` — client HTTP authentifié (JWT bearer) vers toutes
  les routes `/api/mobile/*`.
- `src/storage/session.ts` — token, URL serveur et infos utilisateur en
  stockage sécurisé (`expo-secure-store`).
- `src/screens/` — écran de connexion, tableau de bord, et une paire
  liste/formulaire pour chaque ressource (tracteurs, remorques, chauffeurs,
  commandes, tournées), plus carte live, maintenance, recommandations et
  paramètres.
- `src/screens/LiveMapScreen.tsx` — carte OpenStreetMap/Leaflet embarquée
  dans une WebView (mêmes tuiles OSM que la carte live du site web).
- `src/components/` — composants UI partagés (badges de statut, champs de
  formulaire, sélecteur de liste modal `PickerField`).
