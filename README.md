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

Node ≥ 18.17 — le dépôt épingle **Node 20** (`.nvmrc`, `netlify.toml`) pour des builds reproductibles.

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

## 7. Déploiement (Vercel ou Netlify)

Le dépôt est **prêt à déployer**. Le routage de langue est géré par `middleware.ts`
(préfixe `/fr` · `/en`) et fonctionne nativement sur les deux plateformes.

### Inclus dans le dépôt
| Fichier | Rôle |
|---|---|
| `vercel.json` | Preset Next.js + commandes (Vercel) |
| `netlify.toml` | Build + `@netlify/plugin-nextjs` + Node 20 (Netlify) |
| `.nvmrc` | Version de Node épinglée (**20**) |
| `.env.example` | Variables d'environnement à définir |
| `next.config.mjs` | En-têtes de sécurité + formats d'image AVIF/WebP + `X-Powered-By` retiré |
| `src/app/robots.ts` · `sitemap.ts` | `/robots.txt` + `/sitemap.xml` (26 URLs FR/EN) |
| `src/app/manifest.ts` · `icon.svg` · `opengraph-image.tsx` | Manifeste PWA, favicon, image de partage social 1200×630 |

### Variable d'environnement (une seule)
`NEXT_PUBLIC_SITE_URL` — origine publique canonique, utilisée pour les URL absolues
(sitemap, robots, Open Graph, canonical). Défaut : `https://www.ugpatn.cd`.
La définir dans le projet **pour chaque environnement** (et sur l'URL de preview si souhaité).

### A. Vercel (recommandé pour Next.js — zéro config)
1. Importer le dépôt Git → Vercel détecte **Next.js** automatiquement.
2. Environment Variables → ajouter `NEXT_PUBLIC_SITE_URL = https://www.ugpatn.cd`.
3. **Deploy**. Ajouter le domaine `www.ugpatn.cd` (Settings → Domains) et suivre les instructions DNS.

### B. Netlify
1. Importer le dépôt → Netlify lit `netlify.toml` (build `npm run build`, plugin Next.js, Node 20).
2. Site settings → Environment → ajouter `NEXT_PUBLIC_SITE_URL = https://www.ugpatn.cd`.
3. **Deploy**. Ajouter le domaine, suivre les instructions DNS.
   *(Le plugin `@netlify/plugin-nextjs` est installé automatiquement.)*

### Vérifié au build (26 pages SSG + 5 routes techniques)
`npm run typecheck` → 0 · `npm run build` → 0 · `/robots.txt`, `/sitemap.xml` (26 URLs),
`/manifest.webmanifest`, `/opengraph-image` (200 image/png), `/icon.svg`, en-têtes de sécurité,
redirection i18n `/ → /fr`, `hreflang` FR/EN et `canonical` absolus.

### Après le premier déploiement
- Vérifier `https://<domaine>/robots.txt` et `/sitemap.xml`, puis **soumettre le sitemap**
  dans Google Search Console.
- Contrôler l'aperçu social (Open Graph) — l'image se génère sur `/opengraph-image`.
- Régler `NEXT_PUBLIC_SITE_URL` sur le domaine **définitif** avant l'indexation.
- Rappel contenu (§6) : logo officiel, numéro vert MGP, portraits, visuels/vidéo réels.

---

*UGPTN · MPTN · IDA (Banque mondiale) + AFD · Kinshasa, 2026*
