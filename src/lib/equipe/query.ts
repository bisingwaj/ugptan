/**
 * Couche de lecture de « L'équipe de l'Unité » — l'unique porte d'entrée du
 * site public vers les tables `TeamMember` / `TeamPole`.
 *
 * Trois invariants, dans cet ordre de priorité.
 *
 * ─── 1. Rien ne sort qui ne soit publié ──────────────────────────────────────
 * Masquer une fiche est un geste courant : un départ à acter, un recrutement
 * qui n'est pas encore annoncé. Il retire la personne des quatre emplacements
 * d'un coup, sans qu'il faille y penser emplacement par emplacement.
 *
 * ─── 2. Rien ne sort dans la mauvaise langue ─────────────────────────────────
 * Une fiche dont la fonction n'est pas traduite disparaît de la version
 * concernée, comme un article ou un événement. Un poste affiché en français au
 * milieu d'une grille anglaise ferait passer un défaut de traduction pour un
 * intitulé officiel.
 *
 * ─── 3. Le dessin des pages ne dépend pas de l'état de la base ───────────────
 * Tant qu'AUCUNE fiche publiée n'existe, le contenu d'origine du site prend le
 * relais (cf. src/content/equipe.ts). C'est ce qui permet de livrer le module
 * sans vider l'accueil, la page « L'Unité », la page « Gouvernance » et quatre
 * fiches de composante en attendant que quelqu'un ouvre la console. Dès qu'une
 * fiche publiée existe, la base fait foi seule : le repli ne vient jamais
 * compléter un contenu administré, il le remplace ou s'efface.
 */
import { db } from "@/lib/db";
import { lecteur } from "@/lib/lecture";
import { estOptimisable, mediaSrc, type MediaRef } from "@/lib/medias";
import type { Lang } from "@/lib/pick";
import {
  equipeSeedMembres, seedPole,
  type EquipeSeedMembre,
} from "@/content/equipe";

const lecture = lecteur("equipe");

/* -------------------------------------------------------------------------- */
/* Forme rendue                                                                */
/* -------------------------------------------------------------------------- */

/** Portrait résolu. `src` vide : la carte affiche les initiales. */
export type Portrait = { src: string; alt: string; unoptimized: boolean };

/**
 * Une fiche, telle que les composants d'affichage la consomment.
 *
 * Tous les champs sont déjà résolus dans la langue lue : aucun composant n'a à
 * connaître `pick()`, la table des traductions ni la provenance du portrait.
 */
export type MembreEquipe = {
  id: string;
  /** Nom d'usage, ou `null` pour un poste à pourvoir. */
  nom: string | null;
  role: string;
  /** Nom du pôle dans la langue lue. Vide si la fiche n'en a pas. */
  pole: string;
  mandat: string | null;
  bio: string | null;
  verbatim: string | null;
  email: string | null;
  /** Couleur de la fiche, à défaut celle de son pôle. */
  color: string | null;
  composante: string | null;
  portrait: Portrait;
};

/* -------------------------------------------------------------------------- */
/* Sélections Prisma                                                           */
/* -------------------------------------------------------------------------- */

/** ⚠️ `data` est volontairement absent : cf. le commentaire de lib/actus/query.ts. */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, publicId: true,
  altFr: true, altEn: true, legende: true,
} as const;

const membreSelect = {
  id: true,
  nom: true,
  position: true,
  featured: true,
  color: true,
  email: true,
  composante: true,
  photoPath: true,
  photoMedia: { select: mediaSelect },
  pole: {
    select: {
      color: true,
      translations: { select: { locale: true, nom: true, mission: true } },
    },
  },
  translations: {
    select: { locale: true, nom: true, role: true, mandat: true, bio: true, verbatim: true },
  },
} as const;

type LigneMembre = {
  id: string;
  nom: string | null;
  position: number;
  featured: boolean;
  color: string | null;
  email: string | null;
  composante: string | null;
  photoPath: string | null;
  photoMedia: MediaRef | null;
  pole: {
    color: string | null;
    translations: { locale: string; nom: string; mission: string | null }[];
  } | null;
  translations: {
    locale: string;
    nom: string | null;
    role: string;
    mandat: string | null;
    bio: string | null;
    verbatim: string | null;
  }[];
};

/* -------------------------------------------------------------------------- */
/* Portrait                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Résout le portrait d'une fiche : d'abord la bibliothèque de médias, puis le
 * chemin repris de la version statique, sinon rien.
 *
 * `alt` décrit la personne ET sa fonction (« Noël Jean-David Litanga —
 * Coordonnateur »), reprenant mot pour mot ce que les grilles écrivaient déjà :
 * un lecteur d'écran annonce une photographie de portrait par qui elle
 * représente, pas par le nom du fichier.
 */
function portrait(
  media: MediaRef | null,
  chemin: string | null,
  lang: Lang,
  nom: string | null,
  role: string,
): Portrait {
  const alt = nom ? `${nom} — ${role}` : role;

  if (media) {
    const src = mediaSrc(media);
    const altMedia = (lang === "en" ? media.altEn : media.altFr) || alt;
    return { src, alt: altMedia, unoptimized: !estOptimisable(src) };
  }

  if (chemin) return { src: chemin, alt, unoptimized: !estOptimisable(chemin) };

  return { src: "", alt, unoptimized: false };
}

/* -------------------------------------------------------------------------- */
/* Mise en forme                                                               */
/* -------------------------------------------------------------------------- */

/** Rend une ligne de base dans la langue lue, ou `null` si elle n'y est pas servie. */
function versMembre(ligne: LigneMembre, lang: Lang): MembreEquipe | null {
  const traduction = ligne.translations.find((t) => t.locale === lang);
  if (!traduction?.role?.trim()) return null;

  const nom = traduction.nom?.trim() || ligne.nom?.trim() || null;
  const role = traduction.role.trim();
  const pole = ligne.pole?.translations.find((t) => t.locale === lang)?.nom?.trim() ?? "";

  return {
    id: ligne.id,
    nom,
    role,
    pole,
    mandat: traduction.mandat?.trim() || null,
    bio: traduction.bio?.trim() || null,
    verbatim: traduction.verbatim?.trim() || null,
    email: ligne.email?.trim() || null,
    color: ligne.color?.trim() || ligne.pole?.color?.trim() || null,
    composante: ligne.composante,
    portrait: portrait(ligne.photoMedia, ligne.photoPath, lang, nom, role),
  };
}

/** Rend une fiche du contenu d'origine, dans la même forme. */
function versMembreSeed(membre: EquipeSeedMembre, lang: Lang): MembreEquipe {
  const textes = lang === "en" ? membre.en : membre.fr;
  const pole = seedPole(membre.poleKey);
  const nom = textes.nom?.trim() || membre.nom?.trim() || null;
  const role = textes.role;

  return {
    id: membre.key,
    nom,
    role,
    pole: (lang === "en" ? pole?.en.nom : pole?.fr.nom) ?? "",
    mandat: textes.mandat ?? null,
    bio: textes.bio ?? null,
    verbatim: textes.verbatim ?? null,
    email: membre.email ?? null,
    color: membre.color ?? pole?.color ?? null,
    composante: membre.composante ?? null,
    portrait: portrait(null, membre.photoPath ?? null, lang, nom, role),
  };
}

/* -------------------------------------------------------------------------- */
/* Lectures publiques                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Toutes les fiches publiées, dans l'ordre voulu par l'Unité.
 *
 * Cet ordre porte la hiérarchie — le coordonnateur d'abord, les composantes
 * ensuite, les fonctions transversales pour finir. Ni l'alphabet ni la date de
 * saisie ne le rendraient, d'où la colonne `position` plutôt qu'un tri calculé.
 */
export async function membresEquipe(lang: Lang): Promise<MembreEquipe[]> {
  const lignes = await lecture(
    () => db().teamMember.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: membreSelect,
    }),
    [] as LigneMembre[],
    "grille de l'équipe",
  );

  if (lignes.length === 0) {
    return equipeSeedMembres.map((membre) => versMembreSeed(membre, lang));
  }

  return lignes
    .map((ligne) => versMembre(ligne, lang))
    .filter((membre): membre is MembreEquipe => membre !== null);
}

/**
 * Fiches mises en avant, pour les cartes de coordination de « Gouvernance ».
 *
 * Le tri reprend celui de la grille : la page de gouvernance présente les mêmes
 * personnes dans le même ordre, et les voir permuter d'une page à l'autre
 * donnerait à penser qu'il s'agit de deux listes différentes.
 */
export async function membresEnAvant(lang: Lang): Promise<MembreEquipe[]> {
  const lignes = await lecture(
    () => db().teamMember.findMany({
      where: { status: "PUBLISHED", featured: true },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: membreSelect,
    }),
    [] as LigneMembre[],
    "cartes de coordination",
  );

  if (lignes.length === 0) {
    // Repli sur le contenu d'origine, et seulement si la table est vide de
    // TOUTE fiche publiée : une équipe administrée dont personne n'est mis en
    // avant est un choix légitime, pas une base à compléter.
    const publiees = await lecture(
      () => db().teamMember.count({ where: { status: "PUBLISHED" } }),
      0,
      "décompte des fiches publiées",
    );
    if (publiees > 0) return [];

    return equipeSeedMembres
      .filter((membre) => membre.featured)
      .map((membre) => versMembreSeed(membre, lang));
  }

  return lignes
    .map((ligne) => versMembre(ligne, lang))
    .filter((membre): membre is MembreEquipe => membre !== null);
}

/**
 * Fiche du responsable d'une composante, pour sa page publique.
 *
 * Rend `null` quand aucune fiche publiée ne s'y rattache : la page masque alors
 * la section, exactement comme elle le faisait sans profil renseigné.
 */
export async function membreComposante(code: string, lang: Lang): Promise<MembreEquipe | null> {
  const ligne = await lecture(
    () => db().teamMember.findFirst({
      where: { status: "PUBLISHED", composante: code },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: membreSelect,
    }),
    null as LigneMembre | null,
    `responsable de la composante ${code}`,
  );

  if (ligne) return versMembre(ligne, lang);

  const publiees = await lecture(
    () => db().teamMember.count({ where: { status: "PUBLISHED" } }),
    0,
    "décompte des fiches publiées",
  );
  if (publiees > 0) return null;

  const seed = equipeSeedMembres.find((membre) => membre.composante === code);
  return seed ? versMembreSeed(seed, lang) : null;
}
