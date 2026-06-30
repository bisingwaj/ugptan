# UGPTN — Site institutionnel public

Refonte **Next.js (App Router)** de la direction visuelle « Carbon » du site institutionnel de
l'**UGPTN** — Unité de Gestion du Projet de Transformation Numérique de la RDC
(**PTN-RDC · P180495**, 510 M USD, cofinancement IDA / Banque mondiale + AFD, 26 provinces,
horizon 2029).

> **Source de vérité** : Manuel d'Exécution du Projet (MEP) du 23 juin 2025.
> Montants, dates, indicateurs et structures sont **immuables** (conformité MEP).

---

## 1. Ce qui a changé par rapport à la livraison initiale

La livraison d'origine était un fichier `*.dc.html` autonome (framework « DC » maison + React inliné)
avec **deux endroits où vivait le contenu** : `ugptn-data.js` **et** des blocs codés en dur dans
`renderVals()` (histoires, vidéos par composante, dialogues, événements, gouvernance, glossaire,
FAQ, partenaires, ressources…).

Cette refonte applique la recommandation n°1 du guide de développement :

- **Une seule source de vérité, typée** → tout le contenu vit désormais dans [`src/content/`](src/content),
  en TypeScript, **bilingue FR/EN**. Les ~18 blocs précédemment codés en dur ont été migrés
  dans [`src/content/carbon.ts`](src/content/carbon.ts).
- **Stack web standard** → Next.js 14 (App Router), React 18, TypeScript strict, rendu statique
  (SSG) pour chaque page et chaque langue, SEO (metadata API), polices IBM Plex.
- **Toute l'interactivité conservée** : recherche/filtres/compte à rebours/fiche détaillée des
  marchés, formulaire MGP en 5 étapes + suivi, articles d'actualité, aperçu de documents,
  lightbox vidéo, carte interactive des provinces, espace soumissionnaire (démo), inscription
  aux événements, sélecteur de langue, compteurs animés, héros canvas.

---

## 2. Démarrer

```bash
npm install            # (ajouter --legacy-peer-deps si nécessaire)
npm run dev            # http://localhost:3000  (redirige / → /fr)
npm run build          # build de production (SSG)
npm run start          # sert le build de production
npm run typecheck      # tsc --noEmit
npm run lint
```

Node ≥ 18 (testé sous Node 22).

---

## 3. Architecture

```
src/
├── app/[lang]/              # routes localisées (fr | en) — un dossier par page
│   ├── layout.tsx           # <html lang>, fonts, header/footer/newsletter, lightbox vidéo, SEO
│   ├── page.tsx             # Accueil
│   ├── projet/ ugptn/ gouvernance/ resultats/
│   ├── marches/ transparence/ actualites/ ressources/ evenements/
│   └── mgp/ connexion/ contact/
├── content/                 # ← SOURCE UNIQUE DE VÉRITÉ (typée, bilingue)
│   ├── types.ts             #   schéma TypeScript de tout le contenu
│   ├── data.ts              #   faits MEP immuables (chiffres, ODP, composantes, gouvernance…)
│   ├── marches.ts           #   avis de marchés, méthodes, candidature, documents
│   ├── actualites.ts mgp.ts media.ts
│   ├── carbon.ts            #   contenu « Carbon » migré depuis renderVals (histoires, events…)
│   ├── i18n.ts              #   libellés d'interface + copie de page (FR/EN) → dict(lang)
│   └── index.ts             #   barrel d'export
├── components/
│   ├── chrome/              # Header, Footer, Newsletter
│   ├── ui/                  # Kicker, Counter, Photo, Accordion
│   ├── video/               # VideoProvider (lightbox) + VideoButton
│   ├── home/                # HeroCanvas, ProvinceMap, Histoires
│   ├── marches/ docs/ actus/ mgp/ connexion/ resultats/ events/
├── lib/                     # pick (bilingue), format (nombres + compte à rebours), routes, params
├── styles/                  # tokens.css (palette Carbon) + globals.css (utilitaires + animations)
└── middleware.ts            # préfixe de langue ; redirige / → /fr
```

### Bilingue

Chaque champ texte est `{ fr, en }`. Le helper [`pick(value, lang)`](src/lib/pick.ts) résout la
langue active ; [`dict(lang)`](src/content/i18n.ts) renvoie tous les libellés d'interface déjà
résolus. 6 langues sont prévues (FR/EN opérationnelles) — le sélecteur affiche les six.

---

## 4. Modifier le contenu

Tout le contenu éditable est dans `src/content/`. Exemples :

| Besoin | Fichier |
|---|---|
| Avis de marché (ajout/édition, addenda, calendrier, pièces, stats) | `content/marches.ts` |
| Article d'actualité (corps FR/EN, catégorie, image, vidéo) | `content/actualites.ts` |
| Documents / Transparence | `content/marches.ts` (`documents`) |
| Histoires, événements, dialogues, ressources, glossaire, FAQ, partenaires… | `content/carbon.ts` |
| Chiffres, ODP, composantes, jalons, provinces, gouvernance | `content/data.ts` |
| Libellés d'interface, titres de section, copie de page | `content/i18n.ts` |

> Le typage (`content/types.ts`) garantit qu'un champ manquant ou mal nommé **échoue au build**.

---

## 5. Images & vidéos

- Les **photographies** sont des placeholders art-dirigés servis depuis Unsplash, déclarés dans
  [`content/media.ts`](src/content/media.ts) (`media.img`). En production, remplacer ces URL par
  vos visuels officiels (un CDN `cdn.ugpatn.cd` est déjà autorisé dans `next.config.mjs`).
  Le calque **duotone** est appliqué en CSS (`.duo`) ; un repli SVG s'affiche si une image échoue.
- La **vidéo** par défaut (lightbox) est `media.videoYt` (identifiant YouTube). Une vidéo par
  article : `actualites[].videoYt`. À remplacer par le film institutionnel du Projet.

---

## 6. À renseigner avant la mise en production

- **Logo UGPTN officiel** (actuellement un monogramme).
- **Numéro vert MGP** : affiché « XXX » → `content/carbon.ts` (`contact.numeroVert`).
- **Noms & portraits** de l'équipe et des leads (les rôles/pôles sont conformes au MEP).
- **Photographies & vidéo** réelles (cf. §5).
- **Polices** : chargées depuis Google Fonts (IBM Plex Sans/Mono). Pour un fonctionnement
  100 % hors-ligne, les auto-héberger via `next/font/local`.

---

## 7. Déploiement

Build statique standard Next.js — déployable sur Vercel, Netlify, ou tout hébergeur Node.
Le routage de langue est géré par `middleware.ts` (préfixe `/fr` · `/en`).

---

*UGPTN · MPTN · IDA (Banque mondiale) + AFD · Kinshasa, 2026*
