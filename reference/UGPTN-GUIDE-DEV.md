# UGPTN — Guide d'intégration & de gestion du contenu

> Document de référence pour l'équipe de développement / l'IDE.
> Objet : comprendre l'architecture du site **UGPTN** (version « Carbon »), savoir **où se trouve chaque contenu dynamique**, **où remplacer les images et les vidéos**, et disposer d'une **spécification de back-office** (dashboard d'administration) pour gérer tout le contenu.

---

## 1. Présentation

Site institutionnel public de l'**UGPTN** (Unité de Gestion du Projet de Transformation Numérique de la RDC). Le programme : 510 M USD, cofinancement Banque mondiale (IDA) + AFD, horizon 2029, 26 provinces.

Quatre directions visuelles ont été produites + un « site retenu ». Ce guide documente en priorité la version **« Carbon »** (sobre, IBM-Carbon), qui est la plus complète et sert de référence fonctionnelle. Les autres directions partagent **le même fichier de données**.

Pages du site : `accueil`, `projet`, `ugptn`, `gouvernance`, `marches`, `transparence`, `actualites`, `resultats`, `ressources`, `evenements`, `connexion` (espace soumissionnaire), `mgp` (plaintes), `contact`.

---

## 2. Architecture technique

- **Format** : chaque site est un fichier `*.dc.html` (« Design Component ») — un seul fichier autonome qui s'ouvre dans un navigateur. Rendu type React (classe `Component`) : un **template** (markup avec des trous `{{ … }}`) + une **classe logique** (`renderVals()` qui calcule toutes les valeurs).
- **Source de contenu** : un fichier JS commun **`ugptn-data.js`** qui expose `window.UGPTN_DATA` (objet `D`). C'est le **CMS de fait** : presque tout le contenu y vit, en **bilingue FR/EN** (`{ fr: "…", en: "…" }`).
- **Bilingue** : la plupart des textes sont des objets `{fr, en}`. La langue active est lue par `pick()` dans la logique. 6 langues prévues, FR/EN opérationnelles.
- **Export** : un « bundle » HTML autonome est généré pour chaque direction (`UGPTN-Carbon-PROD.html`, etc.) — tout est inliné, ouvrable hors-ligne.

### ⚠️ Important — deux endroits où vit le contenu
1. **`ugptn-data.js`** → contenu partagé par toutes les directions (marchés, actualités, documents, gouvernance, composantes, médias, MGP…).
2. **À l'intérieur de `Proposition 1 - Carbon.dc.html`**, dans `renderVals()` → du contenu **spécifique à Carbon** a été ajouté en dur (histoires, vidéos par composante, dialogues, événements, FAQ, glossaire, partenaires, etc.).

> **Recommandation forte** pour le back-office : **migrer tout le contenu hardcodé de la section 6 vers `ugptn-data.js`** (ou vers l'API), afin d'avoir **une seule source de vérité** éditable. Voir §8.

---

## 3. Fichiers livrés

```
livraison/
├─ UGPTN-Carbon-PROD.html        ← build production de la version Carbon (autonome)
├─ UGPTN-Site-institutionnel.html← build du site retenu
├─ alternatives/                  ← builds des 4 directions
├─ sources/
│   ├─ Proposition 1 - Carbon.dc.html   ← SOURCE éditable (Carbon)
│   ├─ Proposition 2 - Editorial.dc.html
│   ├─ Proposition 3 - Data.dc.html
│   ├─ Proposition 4 - Humaniste.dc.html
│   ├─ UGPTN - Site institutionnel.dc.html
│   └─ ugptn-data.js              ← LA source de contenu commune
└─ UGPTN-GUIDE-DEV.md            ← ce document
```

Pour modifier le contenu : éditer **`sources/ugptn-data.js`** (et, pour Carbon, certaines valeurs dans `sources/Proposition 1 - Carbon.dc.html` — voir §6/§8), puis régénérer le build.

---

## 4. `ugptn-data.js` — schéma du contenu dynamique partagé

`window.UGPTN_DATA = D`. Champs principaux (les textes notés `{fr,en}` sont bilingues) :

### 4.1 Méta & i18n
- `D.meta` : `{ code, ville, projetLong, tutelle, tutelleLong, bailleurs, unite, uniteLong, arrete, arreteDate }`
- `D.langues` : `[{ code, label, greeting }]`
- `D.i18n` : `{ fr:{…}, en:{…} }` — libellés d'interface : `nav_*`, `cta_*`, `sec_*`, `lbl_*`, `foot_*`, `tag_public`…

### 4.2 Le projet
- `D.chiffres` : `[{ value, unit, pct, label{fr,en}, sub{fr,en} }]` — chiffres-clés.
- `D.composantes` : `[{ code, montant, ida, afd, titre{fr,en}, desc{fr,en}, sous:[{ ref, montant, fr, en }] }]` — les 5 composantes.
- `D.odp` : `[{ code, value, unit, baseline, femmes, label{fr,en} }]` — indicateurs d'objectif (cibles 2029).
- `D.intermediaires` : `[{ value, unit, fr, en }]`
- `D.provinces` : `[{ nom, x, y, prio }]` — points de la carte (x/y en % ; `prio`=province prioritaire).
- `D.jalons` : `[{ date, fr, en }]` — frise chronologique.
- `D.question` : `{fr,en}` ; `D.engagement` : `{fr,en}` — citations institutionnelles.

### 4.3 Gouvernance & organisation
- `D.gouvernance` : `[{ sigle, nom{fr,en}, nature{fr,en}, effectif, presidence{fr,en}, decision{fr,en}, frequence{fr,en} }]` — COPIL / CTP / UGPTN.
- `D.poles` : `[{ nom{fr,en}, role{fr,en}, roles:[ "…" ] }]` — 5 pôles, 21 sous-rôles.
- `D.mandat` : `[{ n, fr, en, descFr, descEn }]`
- `D.principes` : `[{ fr, en, descFr, descEn }]`
- `D.equipe` : `[{ role{fr,en}, pole{fr,en} }]`

### 4.4 Appels d'offres / Marchés  ← **CONTENU DYNAMIQUE CLÉ**
`D.marches` : tableau d'avis. Schéma d'un avis :
```js
{
  ref: "AOI/C1/2026-014",      // référence unique
  type: "AOI",                  // AOI | AON | AMI | SFQC | DC
  comp: "C1",                   // composante (sert au code couleur : C1 bleu, C2 turquoise, C3 violet, C4 magenta, C5 gris)
  publie: "2 juin 2026",        // date de publication (texte)
  limite: "30 sept. 2026",      // date limite (texte)
  limiteISO: "2026-09-30T17:00:00", // ← pilote le COMPTE À REBOURS en direct
  soum: 14,                     // nb de soumissionnaires enregistrés (stat « activité en direct »)
  vues: 1280,                   // nb de vues
  questions: 23,                // nb de questions reçues
  statut: "ouvert",             // ouvert | cloture | attribue
  revue: {fr,en},               // Préalable / Postérieure
  budget: "≈ 88 M USD",
  lieu: {fr,en},
  lots: 3,
  objet: {fr,en},               // titre de l'avis
  resume: {fr,en},              // résumé long (fiche détail)
  attributaire: {fr,en},        // (optionnel) si statut=attribue
  addenda: [{ n, date, note{fr,en} }],
  pieces:  [{ nom{fr,en}, taille }],          // DAO, TDR, bordereau… (PDF)
  calendrier: [{ date, fr, en, done }]        // étapes du calendrier prévisionnel (done=true si passée)
}
```
- `D.marchesMethodes` : `[{ sigle, fr, en }]` — légende des méthodes de passation.
- `D.candidature` : `[{ n, fr, en, d{fr,en} }]` — étapes « devenir soumissionnaire ».

### 4.5 Documents / Transparence
- `D.documents` : `[{ sigle, titre, cat, version, date, langue, taille }]`
- `D.documentsCats` : `[{ code, fr, en }]` — catégories de filtrage.

### 4.6 Actualités / Articles  ← **CONTENU DYNAMIQUE CLÉ**
`D.actualites` : 
```js
{
  date: "23 juin 2025",
  dateISO: "2025-06-23",
  cat: {fr,en},                 // catégorie (sert aussi au filtre)
  img: "hub",                   // ← CLÉ d'image (voir §5 : pointe vers D.media.img.<clé>)
  lieu: "Kinshasa",
  fr: "Titre de l'article…",    // titre (bilingue : fr / en au même niveau)
  en: "Article title…",
  corps: { fr: ["paragraphe 1","paragraphe 2"], en: [...] }, // corps de l'article
  videoYt: "ID_YOUTUBE"         // (optionnel) vidéo associée → bouton « Voir la vidéo »
}
```

### 4.7 Médias  ← **OÙ REMPLACER IMAGES & VIDÉOS** (voir §5)
```js
D.media = {
  videoYt: "ID_YOUTUBE",                 // film du projet (placeholder par défaut, utilisé partout)
  videoTitre: {fr,en}, videoSource: {fr,en}, videoNote: {fr,en},
  img: { hero, citoyens, fibre, datacenter, formation, femmes, tour, ville, hub, data } // URLs d'images par clé
}
```

### 4.8 MGP (plaintes)
- `D.mgpCategories` : `[{fr,en}]` — catégories du formulaire.
- `D.mgpPipeline` : `[{fr,en}]` — étapes de traitement (suivi).
- `D.mgpFaq` : `[{ q{fr,en}, r{fr,en} }]`

---

## 5. Images & vidéos — où et comment remplacer

### 5.1 État actuel (IMPORTANT)
- Les visuels sont des **placeholders** (illustrations génériques) : sur la version **Carbon**, **toutes les images ont été remplacées par un placeholder embarqué en base64** (un dégradé duotone), afin que le fichier autonome n'ait **aucune dépendance réseau** et **aucune erreur console** hors-ligne.
- Concrètement, dans `Proposition 1 - Carbon.dc.html` → `renderVals()`, la ligne d'origine `var img = media.img;` a été remplacée par un objet où **chaque clé pointe vers un data-URI placeholder** :
  ```js
  var img = { hero:"data:image/svg+xml;base64,…", citoyens:"…", fibre:"…", /* etc. */ };
  ```

### 5.2 Mettre les vraies images
Deux options :
1. **Rapide (statique)** — remplacer, dans `D.media.img` (fichier `ugptn-data.js`), chaque clé par l'URL de votre image hébergée :
   ```js
   img: {
     hero:       "https://cdn.ugptn.cd/img/hero.jpg",
     fibre:      "https://cdn.ugptn.cd/img/fibre.jpg",
     // … les 10 clés : hero, citoyens, fibre, datacenter, formation, femmes, tour, ville, hub, data
   }
   ```
   **ET** sur Carbon, **rétablir** `var img = media.img;` (supprimer l'objet placeholder) pour que la page lise de nouveau `D.media.img`.
2. **Propre (back-office/API)** — exposer ces URLs via l'API (collection `media`) et alimenter `D.media.img` au chargement.

> Les **calques duotone** (dégradés CSS en `mix-blend-mode`) restent appliqués par-dessus l'image et lui donnent la couleur de chaque section. Pour une photo « brute », réduire l'opacité de ces calques dans le markup.

### 5.3 Où chaque image apparaît
- `D.media.img.hero` → fond du héros (sur les directions qui utilisent une image ; Carbon a un héros en canvas animé).
- `D.actualites[].img` → vignette de chaque article (clé pointant vers `D.media.img.<clé>`).
- Les **histoires**, **vidéos par composante**, **galerie par province**, **événements**, **bannière de fiche d'appel d'offres** utilisent aussi des clés de `D.media.img` (voir §6 pour leur emplacement actuel sur Carbon).

### 5.4 Vidéos (lecteur YouTube en lightbox)
- Vidéo par défaut : `D.media.videoYt` (identifiant YouTube). Utilisée par **tous** les boutons ▶ tant qu'aucune vidéo spécifique n'est définie.
- Pour une vidéo **par article** : `D.actualites[].videoYt`.
- Emplacements des boutons ▶ : héros d'accueil, cartes « Histoires & impact » (accueil + Résultats), « Le projet en vidéos » (Résultats), bannière de fiche d'appel d'offres, articles d'actualité.
- Le lecteur n'appelle le réseau **que lorsqu'on lance une vidéo** (normal).

---

## 6. Contenu spécifique à Carbon (actuellement codé en dur dans `renderVals()`)

Ces blocs ont été ajoutés directement dans `Proposition 1 - Carbon.dc.html` (objet retourné par `renderVals()`), **et ne sont pas encore dans `ugptn-data.js`**. À migrer vers la donnée/API (voir §8). Chacun est un tableau bilingue d'objets :

| Clé (variable) | Page | Contenu | Champs |
|---|---|---|---|
| `heroKicker`, `heroTitle` | Accueil | Surtitre + titre du héros | textes |
| `histoires` | Accueil + Résultats | Témoignages de bénéficiaires | `{ name, role, img(clé), color, story, videoYt? }` |
| `projVideos` | Résultats | Vidéo par composante | `{ comp, titre, color, img(clé), dur }` |
| `dialogues` | Résultats | Dialogues sectoriels | `{ secteur, color, titre, desc }` |
| `events` | Événements (+ teaser accueil) | Forums/ateliers/consultations/webinaires | `{ id, date, type, lieu, color, statut(avenir/passe), img(clé), titre, desc, places }` |
| `gouvActivites` | Gouvernance | Activités/décisions COPIL·CTP·Coordination | `{ date, org, color, titre, note }` |
| `gouvLeads` | Gouvernance | Rôles de coordination mis en avant | `{ role, pole, color, mandate }` |
| `ugptnMission` | UGPTN | Coordonner/Exécuter/Rendre compte | `{ t, d }` |
| `polesAction` | UGPTN | Mission + activité en cours par pôle | `{ pole, color, mission, act }` |
| `methode` | UGPTN | « Du financement aux résultats » (5 étapes) | `{ t, d }` |
| `engagementsList` | UGPTN | Engagements/standards | `{ t, d, c(color) }` |
| `glossaire` | UGPTN | Sigles expliqués | `{ s, d }` |
| `ugptnFaq` | UGPTN | FAQ sur l'Unité | `{ q, r }` |
| `partners` | Accueil | Logos partenaires (placeholders nommés) | `{ name, kind }` |
| `ressources` | Ressources | Rapports/analyses/notes d'orientation | `{ k(type), c(color), pole, date, titre, meta }` |
| `uniteStats` | UGPTN | Chiffres de l'Unité | `{ v, u, l }` |
| `galleryProvinces` | Accueil | Galerie par province | `{ nom, img(clé) }` |
| `contactAdresse`, `contactTel`, `contactEmail`, `contactTutelles` | Contact + footer | Coordonnées officielles | textes |

Coordonnées officielles actuelles (déjà intégrées) :
- **Adresse** : 15, Avenue Pumbu — Immeuble H, Bâtiment B, 4ᵉ étage, Gombe, Kinshasa, RDC
- **Téléphone** : +243 810 000 355
- **E-mail** : info@ugptn.cd
- **Tutelle** : Ministère des Postes et Télécommunications ; Ministère de l'Économie Numérique
- **Numéro vert MGP** : affiché « XXX » → **à fournir**.

---

## 7. Statique vs dynamique

**Dynamique (doit être éditable via back-office)** :
- Appels d'offres (`D.marches`) + leurs pièces, addenda, calendrier, stats (soum/vues/questions).
- Articles d'actualité (`D.actualites`) + corps + vidéo associée.
- Documents/Transparence (`D.documents`).
- Médias (`D.media` : vidéo + images).
- Événements (`events`).
- Histoires / vidéos par composante / dialogues / galerie (§6).
- Ressources & publications (`ressources`).
- Gouvernance : activités, leads (§6) ; bodies (`D.gouvernance`).
- MGP : catégories, pipeline, FAQ.
- Chiffres, ODP, jalons, composantes (mises à jour périodiques).
- i18n (libellés), coordonnées de contact, numéro vert.

**Statique (structure, ne change pas via contenu)** :
- Mise en page, design, animations, navigation, machine à états (connexion/inscription, stepper MGP), logique de filtres/recherche/compte à rebours.

---

## 8. Spécification du back-office / Dashboard d'administration (A→Z)

Objectif : une interface d'administration pour gérer **tout le contenu dynamique**. Modèle recommandé : **API REST/JSON** + base de données, le site lisant un JSON équivalent à `UGPTN_DATA` (générer `ugptn-data.js` ou servir l'API).

### 8.1 Authentification & rôles (RBAC)
Refléter le cloisonnement du projet :
- `admin` (coordination) — tout.
- `editeur` — actualités, ressources, médias, événements, histoires.
- `passation` — marchés/appels d'offres, documents.
- `mgp` — plaintes (et canal confidentiel EAS/HS **strictement séparé**, accès réservé au Spécialiste VBG/EAS).
- `lecture` — auditeurs (lecture seule).

### 8.2 Modules (collections) du dashboard
1. **Tableau de bord** — KPIs : avis ouverts, plaintes en cours (et SLA 30 j), articles publiés, événements à venir, vues.
2. **Appels d'offres** — CRUD sur `marches` ; champs §4.4 ; statut (ouvert/clôturé/attribué) ; gestion des **pièces** (upload PDF), **addenda**, **calendrier** ; compteurs soum/vues/questions ; publication/dépublication.
3. **Soumissionnaires** — comptes (KYC), offres déposées, suivi (démo aujourd'hui).
4. **Actualités** — CRUD `actualites` ; éditeur de corps (paragraphes FR/EN), catégorie, lieu, image, **vidéo associée**, date de publication.
5. **Documents / Transparence** — CRUD `documents` + catégories ; upload de fichiers, version, langue, taille.
6. **Médias** — bibliothèque d'images (les 10 clés + ajouts) et de **vidéos** (IDs YouTube) ; c'est ici qu'on **remplace les visuels** ; mapping clé → fichier.
7. **Événements** — CRUD `events` ; type, lieu, date, statut, places ; **inscriptions** reçues (le site a déjà le formulaire d'inscription → endpoint à brancher).
8. **Histoires & impact** — CRUD `histoires` (témoignages : nom, rôle, lieu, image, vidéo, citation).
9. **Vidéos par composante / Dialogues / Galerie** — CRUD des blocs §6.
10. **Ressources & publications** — CRUD `ressources` (type, pôle, date, fichier).
11. **Gouvernance** — `gouvernance` (bodies), **activités de la coordination**, **leads** (rôles + portraits).
12. **Le projet** — chiffres, ODP, composantes, jalons, provinces.
13. **MGP** — plaintes (réception → classification → instruction → décision → clôture), catégories, pipeline, FAQ ; **SLA 30 jours** ; canal EAS/HS cloisonné.
14. **i18n & Réglages** — libellés d'interface FR/EN, coordonnées de contact, numéro vert, langues.

### 8.3 Règles transverses
- **Bilingue obligatoire** : chaque champ texte a une variante FR et EN.
- **Workflow de publication** : brouillon → publié (+ horodatage) ; les avis et communiqués sont datés et traçables.
- **Médias** : valider le poids/format ; générer des variantes responsives ; conserver l'URL stable (clé).
- **Cohérence couleur** : `comp` (C1…C5) → couleur de l'avis ; types de ressources → couleur.
- **Export** : le back-office produit le JSON consommé par le site (ou l'API live). Prévoir un endpoint `GET /content` renvoyant l'équivalent de `UGPTN_DATA`.

### 8.4 Schéma d'API suggéré (extrait)
```
GET   /api/content                 → { meta, i18n, marches, actualites, documents, media, events, ... }
CRUD  /api/marches[/:ref]
CRUD  /api/actualites[/:id]
CRUD  /api/documents[/:sigle]
CRUD  /api/events[/:id]      + GET /api/events/:id/inscriptions
CRUD  /api/histoires[/:id]
CRUD  /api/ressources[/:id]
CRUD  /api/media (images + videos)
CRUD  /api/gouvernance, /api/gouv-activites, /api/gouv-leads
GET   /api/mgp/plaintes, POST /api/mgp (dépôt), GET /api/mgp/:ref (suivi)
POST  /api/soumissionnaires (inscription), /api/auth
```

---

## 9. Régénérer le site après modification
1. Éditer `sources/ugptn-data.js` (et/ou le bloc §6 dans `sources/Proposition 1 - Carbon.dc.html`).
2. Régénérer le bundle autonome (inline de tous les assets) → `UGPTN-Carbon-PROD.html`.
3. Vérifier la console (objectif : **zéro erreur**). Les images doivent être soit embarquées, soit servies en ligne pour éviter les erreurs de chargement hors-ligne.

---

## 10. Points d'attention
- **Une seule source de vérité** : migrer le contenu §6 vers la donnée/API (priorité).
- **Numéro vert MGP** : « XXX » → à renseigner.
- **Médias réels** : remplacer les placeholders (§5).
- **EAS/HS** : canal confidentiel strictement cloisonné — ne jamais exposer ses données ailleurs.
- **Accessibilité** : prévoir sous-titres/transcriptions pour les vidéos ; les cibles tactiles et le responsive sont déjà en place.
