# Emplacements vidéo & animations

Ce document recense **où des vidéos sont prévues** sur le site, et comment produire
des animations **directement en code** (Remotion).

## 1. Voir les emplacements

Deux façons :

1. **En contexte, sur les vraies pages** — ajoutez `?slots=1` à n'importe quelle URL :
   - `http://localhost:3000/fr?slots=1`
   - Chaque emplacement vidéo (héros compris) est encadré et étiqueté (`📹 … · 16:9`).
   - Pour quitter : retirez `?slots=1`.

2. **Plan média (storyboard)** — page dédiée : `/fr/medias` (ou `/en/medias`).
   - Liste tous les emplacements : page, zone, format, durée conseillée, statut.

> Source de vérité : [`src/content/videos.ts`](../src/content/videos.ts).

## 2. Inventaire des emplacements

| Emplacement | Page | Format | Durée | Statut |
|---|---|---|---|---|
| Héros — film du projet (fond + lightbox) | Accueil | 16:9 | 60–90 s | Provisoire |
| Héros de page — intro courte (optionnel) | Toutes | 16:9 | 15–30 s | Optionnel |
| Cartes « Histoires & impact » (×4) | Accueil + Résultats | 16:9 | 60–90 s | À fournir |
| « Le projet en vidéos » (×5, par composante) | Résultats | 16:9 | 2–5 min | À fournir |
| Bannière de la fiche d'avis | Marchés | 16:9 | 30–90 s | Optionnel |
| Vidéo associée à un article | Actualités | 16:9 | variable | Optionnel |

## 3. Brancher une vidéo

- **Film par défaut** (héros, témoignages, vidéos par composante, bannière d'avis) :
  `src/content/media.ts → media.videoYt` (identifiant YouTube).
- **Vidéo par article** : `src/content/actualites.ts → actualites[].videoYt`.
- **Témoignages individuels** : ajouter `videoYt` à chaque entrée de `histoires` dans
  `src/content/carbon.ts`.

## 4. Créer des animations en code (Remotion)

```bash
npm run remotion:studio                 # ouvre Remotion Studio (preview live)
npm run remotion:render -- UgptanIntro   # rend remotion/out/UgptanIntro.mp4
```

- Compositions dans [`remotion/`](../remotion) : `UgptanIntro` (intro de marque 16:9),
  `UgptanIntroVertical` (9:16), `KeyFigures` (chiffres-clés animés).
- Éditez-les en React (`remotion/compositions/*`). Le rendu produit un `.mp4`
  à déposer comme média de slot, ou à héberger et référencer.
- Pour intégrer une vidéo **locale** (mp4) plutôt que YouTube dans un slot, on pourra
  ajouter un lecteur `<video>` ; dites-le-moi et je l'ajoute au `VideoProvider`.
