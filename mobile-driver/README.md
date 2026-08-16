# LOGISTICS@MAHDI — App Chauffeur (React Native / Expo)

Application native (Android/iOS) pour les chauffeurs : missions, démarrage/échec de
livraison, preuve de livraison (signature, photo, code-barres), position GPS et
dashcam. Elle consomme les mêmes routes JSON que le portail conducteur web
(`/api/mobile/driver/*`, `/api/driver/position`, `/api/driver/dashcam`).

## Lancer en local (Expo Go)

1. Démarrer le serveur Next.js (`npm run dev` à la racine du dépôt) et exposer-le
   en HTTPS avec un tunnel (ngrok ou cloudflared), comme pour tester la version TWA.
2. Dans ce dossier :
   ```
   npm install
   npx expo start
   ```
3. Scanner le QR code avec l'app **Expo Go** (Android/iOS) installée sur le
   téléphone de test.
4. Sur l'écran de connexion, coller le **lien personnel** d'un chauffeur
   (`https://<votre-tunnel>/driver/<token>`, visible sur sa fiche dans
   l'application dispatcher). L'app enregistre le token et l'URL du serveur en
   stockage sécurisé (`expo-secure-store`).

## Structure

- `src/api/client.ts` — client HTTP vers les routes `/api/mobile/driver/*`.
- `src/storage/session.ts` — token + URL serveur en stockage sécurisé.
- `src/screens/` — Login, Missions (liste des tournées), OrderDetail
  (démarrer/échouer/preuve de livraison), Dashcam.
- `src/components/` — SignaturePad (signature tactile), PhotoCapture (caméra),
  BarcodeScannerModal (scan code-barres).
- `src/hooks/useLocationReporter.ts` — envoi de la position toutes les 30s
  pendant une tournée en cours.

## Build APK / AAB

```
npx eas build --platform android --profile preview
```

(nécessite un compte Expo gratuit — `npx eas login` puis `eas build:configure`
si ce n'est pas déjà fait).
