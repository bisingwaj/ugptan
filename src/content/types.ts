import type { StaticImageData } from "next/image";

import type { Bilingual, Localizable } from "@/lib/pick";

/* ---------------------------------------------------------------------------
   Content schema — the single source of truth for the UGPTN institutional site.
   Mirrors the canonical `ugptn-data.js` (MEP of 23 June 2025) plus the content
   that was previously hard-coded inside the Carbon `renderVals()`.
--------------------------------------------------------------------------- */

export type ImgKey =
  | "hero" | "citoyens" | "fibre" | "datacenter" | "formation"
  | "femmes" | "tour" | "ville" | "hub" | "data" | "sante" | "agri";

export type Meta = {
  unite: string; uniteLong: string;
  projet: string; projetLong: string;
  code: string;
  tutelle: string; tutelleLong: string;
  bailleurs: string;
  arrete: string; arreteDate: string;
  mep: string; ville: string; approche: string;
};

export type Chiffre = { value: number; unit: string; pct?: string; label: Bilingual; sub: Bilingual };

/** Repères institutionnels du projet (portée, calendrier, partenaires) —
 *  mis en avant à la place des montants sur les pages publiques. */
export type Repere = { v: string; label: Bilingual; sub: Bilingual };

export type Odp = { code: string; value: number; unit: Bilingual; baseline: string; femmes: string | null; label: Bilingual };

export type Intermediaire = { value: string; unit: Bilingual; text: Bilingual };

export type SousComposante = { ref: string; montant: number; text: Bilingual };
export type Composante = {
  code: string; montant: number; ida: number; afd: number;
  titre: Bilingual; desc: Bilingual; sous: SousComposante[];
};

/* Les formes du mandat, des principes, de la méthode, des engagements, du
   glossaire, des questions et des publics visés ont quitté ce fichier avec les
   données qu'elles décrivaient : ces blocs vivent en base, et leur saisie a
   ses propres types (cf. src/lib/impact/saisie.ts). */

export type GouvBody = {
  sigle: string; nom: Bilingual; nature: Bilingual;
  /** Bilingue : « 8 membres » restait en français sur la version anglaise. */
  effectif: Bilingual;
  presidence: Localizable; decision: Bilingual; frequence: Bilingual;
};

/**
 * Pôle de l'Unité — taxonomie de référence, celle de l'arrêté.
 *
 * `mission`, `dossier` et `color` viennent de l'ancien `polesAction` de
 * `carbon.ts`, qui décrivait la MÊME organisation sous cinq autres intitulés.
 * La page « L'UGPTN » affichait les deux listes à quatre sections d'intervalle,
 * si bien qu'un lecteur croyait lire deux organisations différentes. Une seule
 * table, donc, et c'est celle-ci.
 */
export type Pole = {
  nom: Bilingual;
  /** Une ligne : ce dont le pôle répond. */
  role: Bilingual;
  /** Deux à trois lignes : comment il l'exerce. */
  mission: Bilingual;
  /** Dossier en cours, sans préfixe : le libellé « En cours » est traduit. */
  dossier: Bilingual;
  /** Accent de la ligne. */
  color: string;
  /** Intitulés des sous-rôles, tels qu'ils figurent à l'arrêté. */
  roles: string[];
};
export type Province = { nom: string; x: number; y: number; prio: boolean };
export type Langue = { code: string; label: string; greeting: string };
export type Profil = { label: Bilingual; page: Bilingual };

export type Actualite = {
  date: string; dateISO: string; cat: Bilingual; img: ImgKey; lieu: string;
  title: Bilingual; corps: { fr: string[]; en: string[] }; videoYt?: string;
  /** Composante(s) rattachée(s) — alimente « Actualités » des pages composante. */
  comps?: string[];
};

export type Addendum = { n: string; date: string; note: Bilingual };
export type Piece = { nom: Bilingual; taille: string };
/** Une étape du calendrier. La date est ISO : le franchissement se calcule à
 *  l'affichage, sinon une page mise en cache montre « à venir » sur une
 *  échéance passée. */
export type CalEtape = { dateISO: string; fr: string; en: string };
export type MarcheStatut = "ouvert" | "cloture" | "attribue" | "infructueux" | "annule";

/**
 * Un avis de marché, tel que le site l'affiche.
 *
 * ⚠️ CE TYPE N'EST PLUS ALIMENTÉ PAR CE DÉPÔT. Les avis viennent de
 * DigiProcure (`src/lib/digiprocure.ts`), qui tient la référence, le
 * calendrier, les pièces et les additifs.
 *
 * Trois champs ont disparu avec la bascule, et leur absence est délibérée :
 * le nombre d'offres reçues, celui de retraits du dossier et celui de vues.
 * Les deux premiers sont une information de marché — savoir que deux
 * entreprises seulement ont déposé la veille de la clôture change le prix
 * qu'une troisième proposera — et le dernier ne mesure rien.
 */
export type Marche = {
  ref: string; type: string; comp: string;
  /** Dates ISO. Le formatage dépend de la langue, il se fait à l'affichage. */
  publieISO: string; limiteISO: string;
  statut: MarcheStatut; budget: Bilingual; lieu: Bilingual; lots: number;
  objet: Bilingual; resume: Bilingual;
  /** Où se procurer le dossier tant qu'il n'est pas téléchargeable. */
  retrait: Bilingual;
  /** Motif d'annulation ou d'infructuosité : c'est ce qu'un candidat vient lire. */
  motif: string | null;
  /** Renseigné au lot 8, quand l'attribution se publie. */
  attributaire?: Bilingual;
  addenda: Addendum[]; pieces: Piece[]; calendrier: CalEtape[];
  /** Fiche de l'avis sur DigiProcure, où le dossier se retire. */
  url: string | null;
};
export type MethodePassation = { sigle: string; label: Bilingual };
export type EtapeCandidature = { n: string; titre: Bilingual; desc: Bilingual };

/* `DocCat`, `Document` et `DocumentCategorie` ont disparu d'ici : le fonds
   documentaire est tenu en base et typé par Prisma (modèles `Document` et
   `DocumentCategory`). Un second type portant le même nom aurait fini par
   diverger de la table. */

export type MgpFaqItem = { q: Bilingual; r: Bilingual };

/** Catégorie du formulaire de plainte. `code` est ce qui part en base : le
 *  formulaire est bilingue, le dossier ne l'est pas. */
export type MgpCategory = { code: string } & Bilingual;

export type Media = {
  videoYt: string; heroFilm: string;
  videoTitre: Bilingual; videoSource: Bilingual; videoNote: Bilingual;
  img: Record<ImgKey, string>;
};

/* ---- Migrated Carbon-specific content (was hard-coded in renderVals) ------- */

export type EventStatut = "avenir" | "passe";
export type Evenement = {
  id: string; date: Bilingual; type: Bilingual; lieu: Bilingual; color: string;
  statut: EventStatut; img: ImgKey; titre: Bilingual; desc: Bilingual; places: Bilingual;
};
export type GouvActivite = { date: Bilingual; org: string; color: string; titre: Bilingual; note: Bilingual };
/**
 * Un partenaire de l'accueil.
 *
 * `logo` porte une image IMPORTÉE (`import ... from "@/../public/..."`), et non
 * un chemin écrit à la main : l'import fait connaître à Next les dimensions du
 * fichier, sans lesquelles `next/image` refuse de le servir — et donc de le
 * convertir en AVIF. Les neuf logos partaient auparavant en PNG bruts, 988 Ko
 * sur le premier écran.
 */
export type Partner = { name: string; kind: Bilingual; logo?: StaticImageData };
export type Ressource = { k: Bilingual; color: string; pole: Bilingual; date: Bilingual; titre: Bilingual; meta: string; comp?: string };
export type GalleryItem = { nom: string; img: ImgKey };

export type Contact = {
  adresse: string; quartier: string; tel: string; email: string;
  tutelles: string[]; numeroVert: string;
};

/* Component colour code → accent (C1..C5). */
export type CompColorMap = Record<string, string>;

/* ---- Pages dédiées par composante (cf. docs/PAGES-COMPOSANTES.md) ---------
   Le contenu ÉDITORIAL des composantes. Les données canoniques du MEP
   (montants, IDA/AFD, sous-composantes) restent lues depuis `composantes`. */

/** Un axe de la problématique : constat, mécanisme, coût de l'inaction. */
export type CompAxe = { t: Bilingual; d: Bilingual };

/** L'exposé du problème auquel la composante répond, avant la description de
 *  ce qu'elle fait : constat structurel → mécanisme → coût du statu quo →
 *  légitimité de l'intervention publique → interconnexions. */
export type CompProblematique = {
  titre: Bilingual;
  lead: Bilingual;
  axes: CompAxe[];
  appui: { fr: string[]; en: string[] };
  /** Interconnexions assumées ; `code` pointe vers une autre composante. */
  liens: { code?: string; t: Bilingual }[];
};

/** Un projet phare d'une composante — corps rédigé + puces + chute. */
export type CompProjet = {
  n: string;                 // "01"
  slug: string;              // ancre : "cloud-souverain"
  sigle?: string;            // "GOVNET", "GOVSOC"…
  titre: Bilingual;
  statut?: Bilingual;        // "Infrastructure stratégique"
  corps: { fr: string[]; en: string[] };
  points?: Bilingual[];
  chute?: Bilingual;
  img?: ImgKey;
};

/** Une brique de l'écosystème de la composante (section sombre). */
export type CompCouche = { t: Bilingual; d: Bilingual };

/** Emplacement vidéo de présentation de la composante. */
export type CompVideoSlot = {
  yt?: string;               // id YouTube
  src?: string;              // ou fichier local (/videos/…)
  titre: Bilingual;
  duree?: string;
  poster: ImgKey;
};

/* ---------------------------------------------------------------------------
   Pages légales (confidentialité, conditions d'utilisation) + avis de première
   visite. Le texte est du contenu éditorial : il vit dans `legal.ts`, jamais
   dans les composants.
--------------------------------------------------------------------------- */

/** Un bloc de texte à l'intérieur d'un article. */
export type LegalBloc =
  /** Paragraphe courant. */
  | { k: "p"; texte: Bilingual }
  /** Énumération simple (obligations, droits, interdits). */
  | { k: "puces"; items: Bilingual[] }
  /** Énumération définie : un intitulé, puis ce qu'il recouvre. */
  | { k: "liste"; items: { t: Bilingual; d: Bilingual }[] }
  /** Encadré mis en exergue — précision qui engage l'Unité. */
  | { k: "note"; texte: Bilingual };

/** Un article numéroté du document, cible d'une ancre du sommaire. */
export type LegalSection = { id: string; titre: Bilingual; blocs: LegalBloc[] };

export type LegalDoc = {
  slug: "confidentialite" | "conditions";
  titre: Bilingual;
  /** Chapô du héros — dit en trois phrases ce que le document règle. */
  chapeau: Bilingual;
  maj: Bilingual;
  sections: LegalSection[];
};

export type ComposanteDetail = {
  code: string;              // "C2"
  slug: string;              // "c2"
  titreLong: Bilingual;      // H1 éditorial
  soustitre: Bilingual;      // chapô du héros
  problematique?: CompProblematique;
  chapeau: { fr: string[]; en: string[] };
  objectifs: Bilingual[];
  projets: CompProjet[];
  ecosysteme?: { titre: Bilingual; lead: Bilingual; couches: CompCouche[] };
  finalite?: { titre: Bilingual; lead: Bilingual; points: Bilingual[] };
  video?: CompVideoSlot;
  odp?: string[];            // indicateurs ODP rattachés
  img: ImgKey;               // visuel du héros
};
