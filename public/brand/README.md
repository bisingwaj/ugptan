# Actifs de marque

Fichiers **générés** par [`scripts/brand-assets.mjs`](../../scripts/brand-assets.mjs) à
partir de `public/assets/ugptn.jpeg`, le logotype officiel tel qu'il a été
fourni (fond blanc opaque, 758 × 384). Ne pas les retoucher à la main : la
prochaine exécution du script les écrase.

```bash
pnpm add -D sharp && node scripts/brand-assets.mjs && pnpm remove sharp
```

`sharp` n'est pas une dépendance du site — celui-ci ne traite aucune image à
l'exécution. Le script ne tourne qu'à la réception d'un nouveau fichier de
marque, il n'est pas branché sur le build.

## Fichiers

| Fichier | Dimensions | Usage |
|---|---|---|
| `ugptn-signature.png` | 316 × 160 | Bandeau (fond clair), affiché à 40px de haut |
| `ugptn-signature-light.png` | 316 × 160 | Pied de page (fond sombre), 44px de haut |
| `ugptn-logo.png` | 630 × 320 | Logotype complet, fonds clairs, impression |
| `ugptn-logo-light.png` | 630 × 320 | Logotype complet, fonds sombres — image de partage social |
| `ugptn-mark.png` | 188 × 256 | Glyphe cartographique seul ; sert à composer `src/app/apple-icon.png` |

Environ 110 Ko au total. Les hauteurs visent le triple de la taille
d'affichage, ce qui couvre les écrans à densité 3×, et rien de plus.

## Deux formats, et pourquoi

Le logotype porte la mention « Unité de gestion du projet de transformation
numérique » sur quatre lignes hautes de quatorze pixels. Ramenées à la hauteur
d'un bandeau de 64px, elles ne forment plus qu'une salissure grise : la
**signature** les retire pour ne garder que le mot-symbole et la carte. Le
logotype **complet** ne vaut qu'au-delà de 500px de large.

Le retrait passe par un étiquetage en composantes connexes et non par un
rognage : la carte descend jusqu'au bas du visuel et chevauche la mention en
abscisse, un rectangle emporterait son lobe inférieur. Le détail du procédé
figure en tête du script.

## Couleurs

| Rôle | Valeur | Équivalent Carbon |
|---|---|---|
| Bleu du réseau cartographique | `#1192E8` | Cyan 50 |
| Anthracite du lettrage | `#161616` | Gray 100 — `--c-black` |
| Jaune du filet | `#F1C21B` | Yellow 30 |
| Rouge du filet | `#DA1E28` | Red 60 — `--red` |

Le bleu de la marque n'est pas celui de l'accent (`--ac`, `#0f62fe`) et ne doit
jamais colorer un élément cliquable : la marque identifie, l'accent agit.

## Deux manques

Un **SVG** de chaque déclinaison. Le vectoriel reste net à toute taille et à
l'impression — les usagers impriment des dossiers ANO et des procès-verbaux —
pour quelques kilo-octets, et rendrait tout ce détourage inutile.

Un **favicon** tiré de la marque. Le glyphe cartographique est un réseau de
traits fins : à 16px il tourne en bouillie, là où `src/app/icon.svg` reste
lisible. L'icône iOS, elle, est toujours affichée en grand et porte bien la
carte (`src/app/apple-icon.png`). Un symbole simplifié, dessiné pour les très
petites tailles, permettrait d'aligner aussi le favicon.
