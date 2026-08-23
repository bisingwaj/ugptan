# Pages dédiées par composante — conception détaillée

> Document de conception. **Aucun code n'est écrit avant validation de ce document.**
> Cible : 5 pages dédiées (C1 → C5) + une page d'index, atteignables en cliquant
> sur une composante depuis l'accueil, la page Projet et la page Résultats.
> Statut : proposition — 11 août 2026.

---

## 1. Ce qui existe aujourd'hui

Les composantes sont affichées à **trois endroits**, toutes en cul-de-sac (aucun lien) :

| Emplacement | Fichier | Rendu actuel |
|---|---|---|
| Accueil — section « Les cinq composantes » | `src/app/[lang]/page.tsx:97-133` | `.comp-row` : code, titre, desc, sous-composantes, budget + barre |
| Le Projet — section « Composantes » | `src/app/[lang]/projet/page.tsx:112-138` | Même contenu, mise en page cellulée |
| Résultats — « Le projet en vidéos » | `src/components/resultats/ProjVideos.tsx` | 5 cartes (une par composante), ouvrent la lightbox vidéo |

Les données canoniques (MEP) existent déjà et **ne bougent pas** :
`composantes[]` (code, montant, IDA, AFD, titre, desc, sous-composantes) dans
`src/content/data.ts`, plus `compColors` (C1 bleu, C2 turquoise, C3 violet,
C4 magenta, C5 gris) et `compImg`.

Ce qui manque : le contenu **éditorial** (chapeau, objectifs, projets phares,
écosystème, finalité), le **responsable**, la **vidéo de présentation**, et les
**rattachements** (actualités, marchés, ressources, indicateurs → composante).

---

## 2. Architecture d'URL

```
/[lang]/composantes                 → index des 5 composantes
/[lang]/composantes/c1              → Accès & inclusion numériques
/[lang]/composantes/c2              → Fondations numériques
/[lang]/composantes/c3              → Compétences & innovation
/[lang]/composantes/c4              → Coordination & gestion
/[lang]/composantes/c5              → Réponse d'urgence (CERC)
```

- Slug = **code institutionnel** (`c1`…`c5`), stable, identique en FR et EN, et
  aligné sur la codification déjà utilisée partout (`AOI/C1/2026-014`, `ODP-1`…).
- Rendu **statique** (`generateStaticParams`) — 10 pages pré-générées (5 × 2 langues).
- Ajout au `sitemap.xml` via `ALL_PATHS` (12 nouveaux chemins avec l'index).

*Alternative écartée :* slugs littéraires (`/composantes/fondations-numeriques`).
Meilleur SEO brut, mais rompt la correspondance avec la codification MEP et
oblige à maintenir deux slugs (FR/EN). Décision réversible : le mapping
`code → slug` est isolé dans `lib/routes.ts`.

---

## 3. Points d'entrée — « cliquer sur une composante »

1. **Accueil** — chaque `.comp-row` devient un `<Link>` vers sa page.
   Survol : nappe de couleur **de la composante** (pas le bleu générique), flèche
   `→` qui se translate, code passant en pleine couleur. Le survol change
   franchement d'état (surface colorée, contraste maîtrisé).
2. **Le Projet** — mêmes lignes cliquables, plus un bouton
   « Découvrir les 5 composantes → » vers l'index.
3. **Résultats** — les cartes « Le projet en vidéos » pointent vers l'ancre
   `#video` de la page de composante (au lieu d'ouvrir directement la lightbox).
4. **Marchés** — le filtre par composante affiche un lien « Voir la composante ».
5. **Navigation** — `Composantes` figure dans le groupe « Le Projet » de
   `NAV_TREE` (`lib/routes.ts`), dont l'en-tête desktop, le tiroir mobile et le
   pied de page dérivent tous les trois.
6. **Entre composantes** — pager « ← C1 · C3 → » en bas de chaque page + barre
   d'onglets C1…C5 collante en haut de page.

---

## 4. Anatomie d'une page de composante

Le texte fourni pour la Composante 2 a une structure qui se généralise aux cinq.
Ordre de lecture retenu : *ce que c'est → pourquoi → ce que ça coûte → ce que ça
construit → qui le porte → les preuves → et après*.

```
┌────────────────────────────────────────────────────────────────────────┐
│ ① HÉROS (fond sombre, teinté couleur composante)                       │
│    UGPTN / Le Projet / Composante 2                                    │
│    ┌──────┐                                                            │
│    │  C2  │  Construire les fondations numériques                      │
│    └──────┘  de l'État congolais                     ┌───────────────┐ │
│    Une transformation numérique fondée sur des       │  55   M USD   │ │
│    infrastructures souveraines, sécurisées et        │  IDA 43,1     │ │
│    interopérables.                                   │  AFD 11,9     │ │
│    [ Voir la vidéo ▶ ]  [ Les projets phares ↓ ]     │  3 sous-comp. │ │
│                                                      │  10 projets   │ │
│                                                      └───────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ ② BARRE D'ONGLETS COLLANTE                                             │
│    C1 · [C2] · C3 · C4 · C5   |   Contexte · Objectifs · Projets ·     │
│                                   Responsable · Actualités             │
├────────────────────────────────────────────────────────────────────────┤
│ ③ CONTEXTE — chapeau éditorial (2 colonnes)                            │
│    4 paragraphes                        │ Encart : sous-composantes    │
│    « La transformation numérique de     │  2.1  Partage & gestion      │
│    l'État ne repose pas uniquement…»    │       des données     23 M   │
│                                         │  2.2  Confiance       17 M   │
│                                         │  2.3  Secteurs clés   15 M   │
├────────────────────────────────────────────────────────────────────────┤
│ ④ VIDÉO DE PRÉSENTATION (pleine largeur, 16:9)      ← EMPLACEMENT DÉDIÉ│
│    Affiche duotone + gros bouton ▶ · titre · durée · sous-titres FR/EN │
│    Sans vidéo fournie : état « À venir » explicite, jamais un blanc    │
├────────────────────────────────────────────────────────────────────────┤
│ ⑤ OBJECTIFS (grille cellulée, 2 colonnes, numérotée)                   │
│    01 Renforcer les infrastructures    06 Favoriser l'interopérabilité │
│    02 Améliorer la connectivité        07 Moderniser l'identification  │
│    … (10 objectifs pour C2)                                            │
├────────────────────────────────────────────────────────────────────────┤
│ ⑥ PROJETS PHARES  ← le cœur de la page                                 │
│    ┌────────────────┬─────────────────────────────────────────────┐    │
│    │ Index collant  │  01 · Le Cloud Souverain du Gouvernement     │    │
│    │ 01 Cloud ▸     │  ─────────────────────────────────────────   │    │
│    │ 02 GOVNET      │  Le Cloud Souverain constitue l'une des      │    │
│    │ 03 GOVSOC      │  infrastructures stratégiques…               │    │
│    │ 04 DPI         │   • IaaS  • PaaS  • SaaS                     │    │
│    │ 05 Identité    │  Le projet vise ainsi à améliorer…           │    │
│    │ …              │  ─────────────────────────────────────────   │    │
│    │ 10 Capacités   │  02 · GOVNET — le réseau sécurisé de l'État  │    │
│    └────────────────┴─────────────────────────────────────────────┘    │
│    Mobile : accordéon, premier volet ouvert                            │
├────────────────────────────────────────────────────────────────────────┤
│ ⑦ ÉCOSYSTÈME (section sombre) — « Ce n'est pas une succession           │
│    d'initiatives indépendantes »                                       │
│    GOVNET ─ connecte  │ Cloud ─ héberge │ GOVSOC ─ protège             │
│    Interop. ─ échange │ Identité ─ identifie │ Confiance ─ sécurise    │
├────────────────────────────────────────────────────────────────────────┤
│ ⑧ AU SERVICE DU CITOYEN — la finalité, en 8 points courts              │
├────────────────────────────────────────────────────────────────────────┤
│ ⑨ RESPONSABLE DE LA COMPOSANTE                                         │
│    ┌────────┐  Christian KAZADI                                        │
│    │portrait│  Responsable de la Composante 2 —                        │
│    │ ou     │  Infrastructures et Services Publics Numériques          │
│    │initiale│  Périmètre : 2.1 · 2.2 · 2.3                             │
│    └────────┘  « Verbatim » (optionnel)   [ Contacter la composante ]  │
├────────────────────────────────────────────────────────────────────────┤
│ ⑩ RATTACHÉS À CETTE COMPOSANTE                                         │
│    Actualités (filtrées) · Marchés en cours (comp: "C2" existe déjà)   │
│    Ressources & publications · Indicateurs ODP liés                    │
│    Chaque bloc disparaît proprement s'il est vide (pas d'état fantôme) │
├────────────────────────────────────────────────────────────────────────┤
│ ⑪ PAGER + CTA   ← C1 Accès & inclusion    C3 Compétences & innovation →│
└────────────────────────────────────────────────────────────────────────┘
```

### Le parti pris visuel : la page se teinte de sa composante

Chaque page redéfinit localement `--ac`, `--acd`, `--ac-light`, `--ac-line`,
`--ac-pale` à partir de `compColors[code]`, sur le conteneur racine de la page.
Conséquence : **tous les composants existants** (`Kicker`, `.btn--primary`,
`.bar__fill`, `.duo`, nappes de survol) prennent la couleur de la composante
sans une ligne de code spécifique. C2 est turquoise de bout en bout, C3 violet,
etc. Le reste du site reste bleu institutionnel.

Contraste vérifié pour chaque couleur : texte blanc sur `#009d9a` (C2) et
`#198038`, texte foncé sinon — les cinq accents passent AA en usage « surface ».

---

## 5. Emplacement vidéo (§④) — spécification

- **Zone** : bandeau pleine largeur 16:9, affiche = photo de la composante en
  traitement duotone à sa couleur, gros bouton ▶ centré, titre + durée + mention
  « sous-titres FR/EN ».
- **Lecture** : réutilise la lightbox existante (`VideoProvider`). Elle accepte
  déjà un id YouTube **ou** un fichier local (`/videos/…mp4`) — aucun nouveau lecteur.
  *Petite évolution nécessaire* : `open(src)` devient `open(src, { titre, source })`
  pour que l'entête de la lightbox affiche le titre de la vidéo de la composante
  et non « Film du projet » (rétrocompatible, appel sans second argument inchangé).
- **Sans vidéo** : état d'attente assumé — affiche + libellé « Vidéo de
  présentation — à venir » + la durée cible. Jamais de zone vide ni de lecteur mort.
- **Registre** : nouvelle entrée dans `content/videos.ts` →
  `key: "composante-presentation"`, `count: 5`, `ratio: 16:9`, `durée 2–4 min`,
  `status: "a_fournir"`. Elle remonte automatiquement dans le plan média `/medias`
  et dans `docs/EMPLACEMENTS-VIDEO.md`.

---

## 6. Modèle de données

Nouveau fichier `src/content/composantes-detail.ts` (le contenu éditorial),
qui **complète** `data.ts` sans le modifier. Types ajoutés à `content/types.ts` :

```ts
export type CompProjet = {
  n: string;                         // "01"
  slug: string;                      // "cloud-souverain" (ancre)
  sigle?: string;                    // "GOVNET", "GOVSOC"
  titre: Bilingual;
  statut?: Bilingual;                // "Infrastructure stratégique"
  corps: { fr: string[]; en: string[] };   // paragraphes
  points?: Bilingual[];              // puces
  chute?: Bilingual;                 // paragraphe de clôture
  img?: ImgKey;
};

export type CompResponsable = {
  nom?: string;                      // absent → pastille d'initiales (comme l'équipe)
  role: Bilingual;                   // intitulé complet
  img?: string;                      // /portraits/…
  bio?: Bilingual;
  verbatim?: Bilingual;              // citation mise en exergue (optionnel)
  email?: string;
};

export type CompCouche = { t: Bilingual; d: Bilingual };   // écosystème

export type ComposanteDetail = {
  code: string;                      // "C2"
  slug: string;                      // "c2"
  titreLong: Bilingual;              // H1 éditorial
  soustitre: Bilingual;              // chapô du héros
  chapeau: { fr: string[]; en: string[] };
  objectifs: Bilingual[];
  projets: CompProjet[];
  ecosysteme?: { titre: Bilingual; lead: Bilingual; couches: CompCouche[] };
  finalite?:   { titre: Bilingual; lead: Bilingual; points: Bilingual[] };
  responsable?: CompResponsable;
  video?: { yt?: string; src?: string; titre: Bilingual; duree?: string; poster: ImgKey };
  odp?: string[];                    // ["ODP-3"] — indicateurs rattachés
  img: ImgKey;                       // visuel du héros
};
```

Champs `comp` ajoutés (optionnels, non cassants) pour les rattachements :

| Contenu | Champ | Remarque |
|---|---|---|
| `marches.ts` | *(déjà présent)* `comp: "C1"…"C5"` | rien à faire |
| `actualites.ts` | `comps?: string[]` | on étiquette les 4 actualités existantes ; aucune actualité inventée |
| `carbon.ts → ressources` | `comp?: string` | déductible des libellés `pole` déjà écrits |
| `data.ts → odp` | mappé dans `composantes-detail.ts` (`odp: [...]`) | pas de modification de `data.ts` |

**Rien de ce qui vient du MEP n'est réécrit** : montants, sous-composantes,
IDA/AFD, ODP restent lus depuis `data.ts`, source de vérité unique.

---

## 7. Contenu — état par composante

| | C1 Accès & inclusion | C2 Fondations | C3 Compétences | C4 Coordination | C5 CERC |
|---|---|---|---|---|---|
| Chapeau | à rédiger | **fourni** | à rédiger | à rédiger | à rédiger |
| Objectifs | à rédiger | **fourni (10)** | à rédiger | à rédiger | à rédiger |
| Projets phares | à rédiger | **fourni (10)** | à rédiger | à rédiger | à rédiger |
| Écosystème | selon pertinence | **fourni** | selon pertinence | — | — |
| Finalité citoyenne | à rédiger | **fourni** | à rédiger | à rédiger | à rédiger |
| Responsable | inconnu | **Christian KAZADI** | inconnu | inconnu | s/o |
| Vidéo | à fournir | à fournir | à fournir | à fournir | à fournir |

La Composante 2 est intégralement couverte par le texte transmis. Rien n'est
perdu : chaque bloc du texte trouve sa section (§3 chapeau, §5 objectifs,
§6 les 10 projets, §7 écosystème, §8 finalité, §9 responsable).

Pour C1, C3, C4, C5, deux options — **question ouverte, cf. §11**.

---

## 8. Fichiers

**À créer**

```
src/content/composantes-detail.ts             contenu éditorial des 5 composantes
src/app/[lang]/composantes/page.tsx           index des composantes
src/app/[lang]/composantes/[code]/page.tsx    page dédiée (statique, 5 × 2 langues)
src/components/composantes/CompSubNav.tsx     onglets collants + ancres (client)
src/components/composantes/ProjetsPhares.tsx  index collant / accordéon mobile (client)
src/components/composantes/CompVideo.tsx      bandeau vidéo + état « à venir »
src/components/composantes/CompResponsable.tsx
src/components/composantes/CompLies.tsx       actualités / marchés / ressources liés
src/components/composantes/CompCard.tsx       carte réutilisée par l'index
docs/PAGES-COMPOSANTES.md                     ce document
```

**À modifier**

```
src/content/types.ts          nouveaux types + champs comp optionnels
src/content/actualites.ts     étiquetage comps[]
src/content/carbon.ts         étiquetage comp des ressources
src/content/videos.ts         emplacement « composante-presentation » ×5
src/content/i18n.ts           libellés nav.composantes + bloc comp.*
src/lib/routes.ts             NAV.composantes + helper compRoute(lang, code)
src/lib/site.ts               ALL_PATHS → sitemap
src/app/[lang]/page.tsx       lignes composantes cliquables
src/app/[lang]/projet/page.tsx idem + CTA index
src/components/resultats/ProjVideos.tsx  cartes → page de composante #video
src/components/chrome/Footer.tsx         lien Composantes
src/components/video/VideoProvider.tsx   titre de vidéo paramétrable
src/styles/globals.css        .comp-link, .comp-tabs, .projets-split, responsive
docs/EMPLACEMENTS-VIDEO.md    nouvel emplacement documenté
```

Aucune dépendance npm ajoutée.

---

## 9. Responsive, accessibilité, SEO

- **≤ 960 px** : héros en une colonne, encart chiffres sous le titre.
- **≤ 760 px** : onglets C1…C5 en défilement horizontal (scroll-snap) ; projets
  phares en accordéon ; deux colonnes → une ; cibles tactiles ≥ 44 px (règles
  mobiles existantes déjà en place dans `globals.css`).
- **Accessibilité** : onglets en `<nav>` avec `aria-current`, accordéon
  `<button aria-expanded>` + région liée, ancres focusables, contraste vérifié
  sur les cinq accents, `prefers-reduced-motion` déjà géré globalement.
- **SEO** : `generateMetadata` par composante (titre « Composante 2 —
  Fondations numériques · UGPTN », description = sous-titre), Open Graph hérité,
  fil d'Ariane, `sitemap.xml` complété, contenu rendu côté serveur (les seules
  parties client sont les onglets et l'accordéon).
- **Performance** : pages statiques, aucune image supplémentaire chargée en
  amont, vidéo chargée uniquement à l'ouverture de la lightbox.

---

## 10. Déroulé d'implémentation proposé

1. Socle : types, routes, i18n, `composantes-detail.ts` avec **C2 complet**.
2. Page dédiée + composants (héros teinté, onglets, vidéo, projets phares,
   responsable, blocs liés, pager) — validée sur C2.
3. Page d'index + points d'entrée cliquables (accueil, projet, résultats, nav, footer).
4. Contenu C1, C3, C4, C5 selon la réponse au §11.
5. Vérifications : `npm run typecheck`, `npm run lint`, `npm run build`, revue
   mobile 390 px / desktop 1440 px, FR et EN.

---

## 11. Décisions prises

1. **Contenu de C1, C3, C4** — rédigé et livré, dans le même moule que C2, à
   partir des données MEP et du contenu déjà publié. Le fichier
   `composantes-detail.ts` porte en tête la mention **« à valider »** pour ces
   quatre composantes ; le texte de C2 est celui transmis par l'UGPTN et fait foi.
2. **Responsables de C1 et C3** — non publiés : le bloc affiche l'intitulé du
   poste avec une pastille d'initiales. Renseigner `responsable.nom` (et
   `responsable.img`) suffira, sans changement de code. C2 : Christian KAZADI.
   C4 : porté par la coordination de l'Unité.
3. **C5 (CERC)** — page courte : contexte, objectifs, séquence d'activation.
   Ni projets phares, ni vidéo, ni responsable.
4. **Slug d'URL** — `/composantes/c2` (code institutionnel).

---

## 12. Prudence éditoriale sur les chiffres (passe site-wide)

Demande : ne pas afficher de chiffres qui puissent être lus comme des promesses.
Principe appliqué — distinguer **ce qui est engagé** de **ce qui est visé** :

| Nature | Traitement |
|---|---|
| Financements signés (enveloppe, IDA, AFD), dates d'accords, jalons | **Conservés tels quels** — ce sont des faits publiés, non des projections |
| Cibles du cadre de résultats (ODP, indicateurs intermédiaires) | Valeurs conservées mais **préfixées « ≈ »**, libellés reformulés en *ambitions à l'horizon 2029*, et **mention de prudence** sous chaque bloc |
| Chiffres dans les textes rédigés | Reformulés : « de l'ordre de », « environ », « plusieurs milliers », « une centaine », « à l'horizon du projet » |
| Engagement de délai MGP (« 100 % des griefs en 30 jours ») | Devient un **objectif** de traitement sous 30 jours |

Mention affichée sous tout bloc d'indicateurs prospectifs (`t.lbl.indicatif`) :

> Ordres de grandeur issus du cadre de résultats du projet. Ces ambitions
> orientent l'exécution ; elles sont revues périodiquement avec les partenaires
> et ne constituent pas un engagement de résultat.

Pages concernées : accueil, Le Projet, Résultats, pages de composante, MGP,
Contact, ainsi que les contenus de `data.ts`, `carbon.ts`, `mgp.ts` et
`composantes-detail.ts`.

Point d'attention : les libellés `lbl.cible` et `sec.resultats` ont changé de
formulation (« cibles 2029 » → « ambitions à l'horizon 2029 »). Si un document
officiel doit reprendre le vocabulaire exact du MEP, c'est le seul endroit où
l'écart est visible.

---

## 13. Sortir les montants du premier plan

Second temps de la même demande : le site ne doit pas donner l'impression d'être
un tableau de financement. Les montants ne sont plus **affichés** ; ils restent
dans `data.ts` (miroir du MEP) pour tout usage documentaire ultérieur.

| Emplacement | Avant | Après |
|---|---|---|
| Encart du héros d'accueil | « Le projet en chiffres » : 510 / 400 / 110 / 165 M USD | « Le projet en bref » : 26 provinces · 5 composantes · horizon 2029 · cofinancement IDA & AFD (`reperes` dans `data.ts`) |
| Lignes de composantes (accueil, Le Projet) | Colonne montant + barre budgétaire + IDA/AFD | Colonne supprimée ; la ligne met en avant l'intitulé, la description et les sous-composantes |
| En-tête de section composantes | « 510 M USD · 5 composantes » | « Cinq composantes, un seul projet. » |
| Héros de page composante | « Enveloppe : 55 M USD · IDA 43,1 · AFD 11,9 » | « Périmètre » : chantiers structurants, sous-composantes, objectifs, horizon, statut |
| Encart sous-composantes | Réf + montant + barre | Réf + intitulé |
| Cartes et tableau de l'index | Montant + barre budgétaire | Nombre de projets phares, de sous-composantes, d'objectifs + filet de couleur |
| Engagements fondateurs (Le Projet) | « IDA, 400 M USD » / « 110 M USD » | Signature des accords, sans montants |
| Chiffres de l'Unité (UGPTN) | « 510 M$ — enveloppe gérée » | « 3 niveaux de gouvernance » |

**Exception assumée : les marchés publics.** Le budget estimé reste affiché sur
les avis (`marches.ts`) — c'est une information due aux soumissionnaires pour
calibrer une offre, pas un argument de communication.

---

## 14. Exigence éditoriale : écrire depuis un métier

La doctrine de rédaction du site est écrite dans
[`docs/doctrine-redactionnelle.md`](doctrine-redactionnelle.md).
Elle est à lire **avant** d'écrire ou de réviser tout contenu. Elle fixe :

- le **profil d'expert à endosser** selon la matière (économiste des
  infrastructures télécoms pour C1, architecte d'e-gouvernement pour C2,
  économiste du capital humain pour C3, spécialiste de la gestion de projets IFI
  pour C4, etc.) ;
- la **chaîne d'argumentation en cinq temps** : constat structurel → mécanisme du
  blocage → coût du statu quo → légitimité de l'intervention publique →
  interconnexions ;
- l'obligation de **relier** — au moins deux dépendances explicites vers d'autres
  composantes ou politiques publiques par page ;
- la liste des **tournures interdites** et le **test de non-généricité** : une
  phrase qui resterait vraie en changeant de pays ou de composante est à réécrire.

### La section « La problématique »

Chaque page de composante ouvre désormais, après le héros, sur l'exposé du
problème auquel elle répond — avant toute description de ce qu'elle fait.
Structure portée par le champ `problematique` de `ComposanteDetail` :

| Élément | Rôle |
|---|---|
| `titre` | La formulation du problème en une phrase tenable |
| `lead` | Le cadrage : de quelle nature est la difficulté |
| `axes` (×3) | Le constat structurel · le mécanisme du blocage · le coût du statu quo |
| `appui` | Pourquoi l'action publique est légitime et efficace ici |
| `liens` | Les interconnexions, dont celles cliquables vers d'autres composantes |

**État d'avancement.** L'ensemble du site est passé à ce niveau de rédaction :

| Page | Profil endossé | Ce qui a été repris |
|---|---|---|
| Composantes C1 → C5 | Selon la matière (cf. compétence) | Problématique complète + chapeau de périmètre. Le texte de fond de C2 reste celui transmis par l'UGPTN |
| Le Projet | Stratège de politique publique | Contexte (le retard n'est pas technologique), avant/après réécrits en mécanismes, bénéficiaires « à quelle condition », FAQ citoyenne |
| Résultats | Spécialiste suivi-évaluation | Distinction indicateurs d'objectif / intermédiaires et ce qu'ils ne garantissent pas ; dialogues sectoriels reformulés en usages précis |
| L'UGPTN | Praticien de l'exécution IFI | Mandat, principes, pôles, méthode, engagements, FAQ — chaque item porte un mécanisme vérifiable |
| Gouvernance | Juriste des institutions | La règle de séparation orientation / instruction / exécution, rôle réel du COPIL et du CTP |
| Marchés | Spécialiste passation Banque mondiale | Écrit pour une entreprise qui décide si elle candidate : recevabilité, addenda, horodatage, critères annoncés |
| MGP | Spécialiste sauvegardes & VBG/EAS | Écrit pour la personne qui hésite à saisir : anonymat, absence de représailles, recours, canal confidentiel |
| Transparence | — | Ce qui est publié **et** ce qui ne l'est pas, avec le motif |
| Accueil, Ressources, Contact, Événements | — | Chapôs et intertitres repris |

Les contenus purement factuels (montants du MEP, dates, sigles) n'ont pas été
touchés. Les libellés d'interface (boutons, colonnes, filtres) non plus.
