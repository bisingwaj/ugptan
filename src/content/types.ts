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

export type Odp = { code: string; value: number; unit: string; baseline: string; femmes: string | null; label: Bilingual };

export type Intermediaire = { value: string; unit: string; text: Bilingual };

export type SousComposante = { ref: string; montant: number; text: Bilingual };
export type Composante = {
  code: string; montant: number; ida: number; afd: number;
  titre: Bilingual; desc: Bilingual; sous: SousComposante[];
};

export type GouvBody = {
  sigle: string; nom: Bilingual; nature: Bilingual; effectif: string;
  presidence: Localizable; decision: Bilingual; frequence: Bilingual;
};

export type Mandat = { n: string; titre: Bilingual; desc: Bilingual };
export type Principe = { titre: Bilingual; desc: Bilingual };
export type Pole = { nom: Bilingual; role: Bilingual; roles: string[] };
export type Membre = { role: Bilingual; pole: Bilingual; nom?: string; img?: string };
export type Jalon = { date: string; text: Bilingual };
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
export type CalEtape = { date: string; fr: string; en: string; done: boolean };
export type MarcheStatut = "ouvert" | "cloture" | "attribue";
export type Marche = {
  ref: string; type: string; comp: string;
  publie: string; limite: string; limiteISO: string;
  statut: MarcheStatut; revue: Bilingual; budget: string; lieu: Bilingual; lots: number;
  objet: Bilingual; resume: Bilingual; attributaire?: Bilingual;
  addenda: Addendum[]; pieces: Piece[]; calendrier: CalEtape[];
  soum: number; vues: number; questions: number;
};
export type MethodePassation = { sigle: string; label: Bilingual };
export type EtapeCandidature = { n: string; titre: Bilingual; desc: Bilingual };

export type DocCat = "reference" | "passation" | "sauvegardes" | "fiduciaire";
export type Document = {
  sigle: string; titre: string; cat: DocCat;
  version: string; date: string; langue: string; taille: string;
};
export type DocumentCategorie = { code: DocCat; label: Bilingual };

export type MgpFaqItem = { q: Bilingual; r: Bilingual };

export type Media = {
  videoYt: string; heroFilm: string;
  videoTitre: Bilingual; videoSource: Bilingual; videoNote: Bilingual;
  img: Record<ImgKey, string>;
};

/* ---- Migrated Carbon-specific content (was hard-coded in renderVals) ------- */

export type Histoire = { name: string; role: Bilingual; img: ImgKey; color: string; story: Bilingual; videoYt?: string };
export type ProjVideo = { comp: string; titre: Bilingual; color: string; img: ImgKey; dur: string };
export type Dialogue = { secteur: Bilingual; color: string; titre: Bilingual; desc: Bilingual };
export type EventStatut = "avenir" | "passe";
export type Evenement = {
  id: string; date: Bilingual; type: Bilingual; lieu: Bilingual; color: string;
  statut: EventStatut; img: ImgKey; titre: Bilingual; desc: Bilingual; places: Bilingual;
};
export type GouvActivite = { date: Bilingual; org: string; color: string; titre: Bilingual; note: Bilingual };
export type GouvLead = { role: Bilingual; pole: Bilingual; color: string; mandate: Bilingual; nom?: string; img?: string };
export type MissionItem = { t: Bilingual; d: Bilingual };
export type PoleAction = { pole: Bilingual; color: string; mission: Bilingual; act: Bilingual };
export type MethodeEtape = { t: Bilingual; d: Bilingual };
export type EngagementItem = { t: Bilingual; d: Bilingual; color: string };
export type GlossaireItem = { s: string; d: Bilingual };
export type FaqItem = { q: Bilingual; r: Bilingual };
export type Partner = { name: string; kind: Bilingual; logo?: string };
export type Ressource = { k: Bilingual; color: string; pole: Bilingual; date: Bilingual; titre: Bilingual; meta: string; comp?: string };
export type UniteStat = { v: string; u?: string; l: Bilingual };
export type GalleryItem = { nom: string; img: ImgKey };
export type HumainPoint = { big: string; u: Bilingual; t: Bilingual };
export type ProjetImpact = { n: string; t: Bilingual; av: Bilingual; ap: Bilingual };
export type Persona = { k: Bilingual; d: Bilingual };

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

/** Responsable de la composante. Sans `nom`, une pastille d'initiales s'affiche. */
export type CompResponsable = {
  nom?: string;
  role: Bilingual;
  img?: string;
  bio?: Bilingual;
  verbatim?: Bilingual;
  email?: string;
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
  responsable?: CompResponsable;
  video?: CompVideoSlot;
  odp?: string[];            // indicateurs ODP rattachés
  img: ImgKey;               // visuel du héros
};
