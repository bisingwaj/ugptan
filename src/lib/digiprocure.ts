import "server-only";

import type { Addendum, Marche, MarcheStatut, Piece } from "@/content/types";
import { DIGIPROCURE_URL } from "@/lib/external";

/**
 * Les avis de marché, lus sur DigiProcure.
 *
 * ⚠️ CE SITE N'EST PLUS LA SOURCE. Les avis vivaient jusqu'ici dans
 * `src/content/marches.ts`, écrits en dur. Ils appartiennent désormais à la
 * plateforme de passation, seule à tenir la référence, le calendrier, les
 * pièces et les additifs — et seule à pouvoir garantir qu'un avis affiché ici
 * correspond à une procédure réellement ouverte.
 *
 * ─── Ce module ne casse jamais la page ───────────────────────────────────────
 *
 * Une plateforme indisponible, une réponse mal formée, un champ renommé de
 * l'autre côté : dans tous ces cas on rend une liste vide et l'on trace. Le
 * visiteur voit alors « aucun avis publié » — c'est faux quelques minutes, et
 * c'est infiniment préférable à une page d'erreur sur le site institutionnel
 * d'une unité de gestion de projet.
 *
 * Chaque avis est validé SÉPARÉMENT : un avis malformé est écarté, les autres
 * passent. Une réponse partiellement inattendue ne doit pas vider la page.
 *
 * ─── Le contrat ─────────────────────────────────────────────────────────────
 *
 * La forme lue ci-dessous reproduit la projection publique de DigiProcure
 * (`src/lib/marches/public.ts` dans l'autre dépôt). C'est un doublon assumé :
 * les deux applications sont déployées séparément, et un type partagé les
 * lierait au même instant de mise en ligne. Ce qui protège de la divergence,
 * c'est la validation ci-dessous, pas une importation.
 */

type Bilingue = { fr: string; en: string };

type AvisPublic = {
  reference: string;
  etiquette: string;
  composante: string;
  statut: string;
  objet: Bilingue;
  resume: Bilingue;
  lieu: Bilingue;
  retrait: Bilingue;
  budget: Bilingue;
  publieISO: string;
  clotureISO: string;
  motif: string | null;
  url: string;
  lots: { numero: number; intitule: Bilingue; description: Bilingue; budget: Bilingue }[];
  calendrier: { type: string; instantISO: string; version: number; motif: string | null }[];
  pieces: { code: string; intitule: Bilingue; tailleOctets: string; typeMime: string }[];
  /* ⚠️ DigiProcure ne sert PAS le texte d'un additif, seulement son objet. Le
     texte modifie le dossier, et le dossier s'obtient après inscription : c'est
     l'inscription qui produit le registre des retraits, et lui qui fait
     parvenir les additifs suivants. */
  additifs: { numero: number; objet: Bilingue; publieISO: string; reportClotureISO: string }[];
};

/**
 * Cinq minutes.
 *
 * Un avis ne change pas plus vite que cela, et le compte à rebours affiché est
 * recalculé chez le visiteur à partir de la date limite : un cache de cinq
 * minutes ne peut donc pas montrer « ouvert » sur un marché clos.
 */
const FRAICHEUR_S = 300;

/** L'origine de DigiProcure, déduite de l'adresse déjà configurée pour le bouton. */
function origine(): string | null {
  const brut = process.env.DIGIPROCURE_API_URL || DIGIPROCURE_URL || "";
  if (!brut) return null;
  try {
    return new URL(brut).origin;
  } catch {
    return null;
  }
}

const STATUTS: readonly string[] = ["ouvert", "cloture", "attribue", "infructueux", "annule"];

const texteBilingue = (v: unknown): Bilingue | null => {
  if (!v || typeof v !== "object") return null;
  const { fr, en } = v as Record<string, unknown>;
  if (typeof fr !== "string") return null;
  return { fr, en: typeof en === "string" && en.trim() ? en : fr };
};

const dateValide = (iso: unknown): string | null =>
  typeof iso === "string" && !Number.isNaN(Date.parse(iso)) ? iso : null;

/** « 2,4 Mo ». Les octets bruts n'apprennent rien à qui doit décider s'il télécharge. */
function taille(octets: string): string {
  const n = Number(octets);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

/** Les libellés des étapes, côté site : DigiProcure ne sert que des codes. */
const ETAPES: Record<string, Bilingue> = {
  PUBLICATION: { fr: "Publication de l'avis", en: "Notice published" },
  BUTOIR_QUESTIONS: { fr: "Date limite des questions", en: "Deadline for clarification requests" },
  CLOTURE: { fr: "Date limite de remise des offres", en: "Bid submission deadline" },
  OUVERTURE: { fr: "Séance d'ouverture des plis", en: "Bid opening session" },
  FIN_VALIDITE: { fr: "Fin de validité des offres", en: "End of bid validity" },
};

/** Convertit un avis, ou rend `null` s'il manque de quoi l'afficher honnêtement. */
function convertir(brut: unknown): Marche | null {
  if (!brut || typeof brut !== "object") return null;
  const a = brut as Partial<AvisPublic>;

  const objet = texteBilingue(a.objet);
  const resume = texteBilingue(a.resume);
  const lieu = texteBilingue(a.lieu);
  const budget = texteBilingue(a.budget);
  const limiteISO = dateValide(a.clotureISO);
  const publieISO = dateValide(a.publieISO);

  if (
    typeof a.reference !== "string" || !a.reference ||
    typeof a.composante !== "string" ||
    typeof a.etiquette !== "string" ||
    typeof a.statut !== "string" || !STATUTS.includes(a.statut) ||
    !objet || !resume || !lieu || !budget || !limiteISO || !publieISO
  ) {
    return null;
  }

  /* Une seule version par étape : la dernière. Les reports antérieurs sont
     conservés par DigiProcure, mais un calendrier public qui afficherait deux
     dates limites serait illisible. */
  const parEtape = new Map<string, { instantISO: string; version: number }>();
  for (const jalon of Array.isArray(a.calendrier) ? a.calendrier : []) {
    const iso = dateValide(jalon?.instantISO);
    if (!iso || typeof jalon?.type !== "string" || !ETAPES[jalon.type]) continue;
    const retenu = parEtape.get(jalon.type);
    const version = typeof jalon.version === "number" ? jalon.version : 1;
    if (!retenu || version > retenu.version) parEtape.set(jalon.type, { instantISO: iso, version });
  }

  const pieces: Piece[] = (Array.isArray(a.pieces) ? a.pieces : []).flatMap((p) => {
    const nom = texteBilingue(p?.intitule);
    return nom ? [{ nom, taille: taille(String(p?.tailleOctets ?? "")) }] : [];
  });

  /* Les additifs parus. Un objet illisible ou une date invalide écartent la
     ligne, jamais l'avis entier : un additif mal formé ne doit pas faire
     disparaître un marché de la vitrine. */
  const addenda: Addendum[] = (Array.isArray(a.additifs) ? a.additifs : []).flatMap((ad) => {
    const note = texteBilingue(ad?.objet);
    const dateISO = dateValide(ad?.publieISO);
    if (!note || !dateISO || typeof ad?.numero !== "number") return [];
    return [
      {
        n: String(ad.numero).padStart(2, "0"),
        dateISO,
        note,
        reportISO: dateValide(ad?.reportClotureISO),
      },
    ];
  });

  return {
    ref: a.reference,
    type: a.etiquette,
    comp: a.composante,
    statut: a.statut as MarcheStatut,
    publieISO,
    limiteISO,
    objet,
    resume,
    lieu,
    budget,
    retrait: texteBilingue(a.retrait) ?? { fr: "", en: "" },
    motif: typeof a.motif === "string" && a.motif.trim() ? a.motif : null,
    lots: Array.isArray(a.lots) ? a.lots.length : 0,
    calendrier: [...parEtape.entries()]
      .map(([type, { instantISO }]) => ({ dateISO: instantISO, ...ETAPES[type]! }))
      .sort((x, y) => x.dateISO.localeCompare(y.dateISO)),
    pieces,
    addenda,
    url: typeof a.url === "string" && /^https?:\/\//i.test(a.url) ? a.url : null,
  };
}

/**
 * Les avis publiés, ou une liste vide.
 *
 * Ne lève jamais. Voir l'en-tête : sur une page institutionnelle, une liste
 * vide vaut mieux qu'une erreur.
 */
export async function chargerMarches(): Promise<Marche[]> {
  const base = origine();
  if (!base) return [];

  try {
    const reponse = await fetch(`${base}/api/public/notices`, {
      headers: { accept: "application/json" },
      next: { revalidate: FRAICHEUR_S, tags: ["marches"] },
    });
    if (!reponse.ok) {
      console.error(`[marchés] DigiProcure a répondu ${reponse.status}`);
      return [];
    }

    const charge: unknown = await reponse.json();
    const liste = (charge as { avis?: unknown })?.avis;
    if (!Array.isArray(liste)) {
      console.error("[marchés] réponse inattendue de DigiProcure");
      return [];
    }

    const avis = liste.map(convertir).filter((m): m is Marche => m !== null);
    if (avis.length < liste.length) {
      console.error(`[marchés] ${liste.length - avis.length} avis écarté(s) : forme inattendue`);
    }
    return avis;
  } catch (erreur) {
    console.error("[marchés] DigiProcure injoignable", erreur);
    return [];
  }
}

/** Les avis ouverts d'une composante, pour les pages de composante. */
export async function marchesOuvertsDe(code: string): Promise<Marche[]> {
  const avis = await chargerMarches();
  return avis.filter((m) => m.comp === code && m.statut === "ouvert");
}
