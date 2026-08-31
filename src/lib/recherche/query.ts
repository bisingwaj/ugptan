/**
 * Recherche globale — la seule lecture du site qui traverse tous les fonds.
 *
 * Le site tenait jusqu'ici cinq recherches cloisonnées : une par section, chacune
 * limitée à sa propre table. Un visiteur qui cherche « Kasaï » devait deviner
 * laquelle interroger. Ce module ne remplace aucune d'elles — il les appelle.
 *
 * ─── Pourquoi `contains` et non `to_tsvector` ────────────────────────────────
 *
 * Les quatre recherches de section filtrent en `contains` + `insensitive`, donc
 * en `ILIKE` (cf. `clauseRecherche` dans docs/query.ts et galerie/query.ts,
 * `filtreTraductions` dans actus/query.ts et events/query.ts). Passer celle-ci
 * en index plein texte l'aurait rendue DIFFÉRENTE des cinq autres : le même mot
 * n'aurait pas rendu le même nombre de résultats ici et sur la page de section,
 * et l'écart aurait été impossible à expliquer au visiteur. À l'échelle du fonds
 * — quelques centaines de lignes par table, un catalogue institutionnel et non
 * un moteur de presse — `ILIKE` répond en quelques millisecondes. Le jour où le
 * volume le justifiera, c'est la clause PARTAGÉE de chaque module qu'il faudra
 * changer, et les six recherches suivront ensemble.
 *
 * ⚠️ LIMITE CONNUE, héritée des cinq autres : `mode: "insensitive"` ignore la
 * casse, pas les accents. « evenement » ne trouve donc pas « événement ». La
 * corriger demande une colonne normalisée ou l'extension `unaccent`, donc une
 * migration : c'est un chantier propre, pas un correctif à glisser ici.
 *
 * ─── Six fonds, deux natures ─────────────────────────────────────────────────
 *
 * Quatre vivent dans NOTRE base et se filtrent en SQL : articles, événements,
 * documents, albums. Deux se filtrent en mémoire, et pour deux raisons
 * différentes :
 *
 *   · les COMPOSANTES sont cinq à dix lignes, déjà résolues et déjà mises en
 *     cache par `composantesPubliques` — descendre un filtre en base coûterait
 *     une requête de plus pour trier ce qui tient dans un tableau ;
 *   · les AVIS DE MARCHÉ n'appartiennent pas à cette base. Ils sont lus sur
 *     DigiProcure (cf. lib/digiprocure.ts), qui n'expose pas de recherche : la
 *     seule façon de les interroger est de charger la liste publique, déjà en
 *     cache, et de la filtrer ici.
 *
 * `chargerMarches` ne lève jamais et rend une liste vide quand la plateforme est
 * injoignable. Le groupe « Avis de marché » disparaît alors des résultats, comme
 * un fonds sans correspondance. C'est la dégradation que la page « Marchés »
 * assume déjà, pour la même raison : sur un site institutionnel, une liste
 * incomplète vaut mieux qu'une page d'erreur.
 *
 * Les quatre lectures en base, elles, passent par `lecture()` de leur module et
 * relaient donc la panne : une base éteinte doit rendre une erreur, pas un
 * « aucun résultat » qui serait un mensonge mis en cache.
 */
import type { Lang } from "@/lib/pick";
import { NAV, route } from "@/lib/routes";
import { htmlToText, truncate } from "@/lib/html/sanitize";
import { listerActualites } from "@/lib/actus/query";
import { listerEvenements } from "@/lib/events/query";
import { listerDocuments } from "@/lib/docs/query";
import { listerAlbums } from "@/lib/galerie/query";
import { composantesPubliques } from "@/lib/projet/query";
import { chargerMarches } from "@/lib/digiprocure";

/* -------------------------------------------------------------------------- */
/* Formes                                                                      */
/* -------------------------------------------------------------------------- */

export const TYPES_RESULTAT = [
  "publication",
  "actu",
  "composante",
  "marche",
  "evenement",
  "album",
] as const;

export type TypeResultat = (typeof TYPES_RESULTAT)[number];

export const estTypeResultat = (valeur: string): valeur is TypeResultat =>
  (TYPES_RESULTAT as readonly string[]).includes(valeur);

/** Un résultat, déjà résolu dans la langue de lecture et prêt à l'affichage. */
export type Resultat = {
  /** Clé de rendu : le type préfixe l'identifiant, qui n'est unique que par table. */
  cle: string;
  type: TypeResultat;
  titre: string;
  /** Extrait en texte nu, centré sur la requête quand elle y figure. */
  extrait: string;
  /** Chemin interne, préfixe de langue compris. */
  chemin: string;
  /** Ligne mono sous le titre : catégorie, référence, lieu. `null` s'il n'y a rien à dire. */
  meta: string | null;
  dateLabel: string | null;
  dateISO: string | null;
  /** La requête figure-t-elle dans le TITRE ? Départage l'ordre du groupe. */
  surTitre: boolean;
};

export type GroupeResultats = {
  type: TypeResultat;
  /** Les résultats montrés, au plus `PAR_GROUPE`. */
  items: Resultat[];
  /** Le nombre TOTAL de correspondances du fonds, montrées ou non. */
  total: number;
  /**
   * Où aller voir le reste, quand le groupe est plafonné. `null` quand tout est
   * déjà à l'écran.
   *
   * Deux destinations possibles, et le choix n'est pas cosmétique :
   *
   *   · la page de SECTION, requête conservée, pour les trois fonds dont la
   *     page accepte `?q=` ET liste bien ce fonds — communiqués, événements,
   *     documents. Le visiteur y gagne les filtres propres de la section ;
   *   · à défaut, cette même page de recherche RESTREINTE à ce fonds. C'est le
   *     cas des composantes et des avis de marché, dont les pages n'ont pas de
   *     recherche, et surtout des GALERIES : `/gallery?q=…` filtre les visuels
   *     et masque explicitement le bandeau des albums (cf. `bandeauAlbums` dans
   *     sa page). Y envoyer quelqu'un qui vient de lire « 12 galeries » le
   *     ferait atterrir sur zéro galerie, ce qui est pire que ne rien proposer.
   */
  lienPlus: string | null;
};

export type Recherche = {
  /** La requête telle qu'elle a été retenue, déjà nettoyée. */
  q: string;
  groupes: GroupeResultats[];
  total: number;
};

/** Résultats montrés par fonds avant de renvoyer à la recherche de la section. */
export const PAR_GROUPE = 6;

/**
 * Longueur minimale d'une requête retenue.
 *
 * En deçà de deux caractères, `ILIKE '%a%'` traverse chaque table pour ramener
 * presque tout : le visiteur reçoit un mur qui ne répond pas à sa question, et
 * la base paie six lectures pour rien.
 */
export const MIN_CARACTERES = 2;

/**
 * Plafond de ce qu'un fonds rapatrie avant tri.
 *
 * La page n'en montre que `PAR_GROUPE`, mais le décompte annoncé doit être vrai
 * et le tri « titre d'abord » doit voir plus que les six premières lignes. Cent
 * suffit très largement à l'échelle du site, et borne le cas d'un mot très
 * courant qui correspondrait à tout un fonds.
 */
const PLAFOND = 100;

/* -------------------------------------------------------------------------- */
/* Extraits                                                                    */
/* -------------------------------------------------------------------------- */

const LONGUEUR_EXTRAIT = 180;

const contient = (texte: string, q: string) => texte.toLowerCase().includes(q.toLowerCase());

/**
 * Extrait centré sur la requête.
 *
 * Un résumé tronqué à ses 180 premiers caractères montre presque toujours
 * l'introduction, jamais le passage qui a fait remonter la fiche : le visiteur
 * doit alors ouvrir la page pour comprendre POURQUOI elle est là. On cadre donc
 * autour de la première occurrence, avec une amorce de contexte devant elle, et
 * l'on retombe sur le début du texte quand la requête n'y figure pas — cas
 * normal d'une fiche trouvée par son seul titre.
 *
 * La découpe recule jusqu'à l'espace précédent : couper au milieu d'un mot
 * donne une bouillie qui se lit comme un défaut d'affichage.
 */
function extraitAutour(texte: string, q: string): string {
  const propre = texte.replace(/\s+/g, " ").trim();
  if (!propre) return "";
  if (propre.length <= LONGUEUR_EXTRAIT) return propre;

  const position = propre.toLowerCase().indexOf(q.toLowerCase());
  if (position < 0) return truncate(propre, LONGUEUR_EXTRAIT);

  /* Un quart de l'extrait en amorce devant la correspondance : assez pour
     rattacher la phrase, pas au point de repousser le mot cherché hors du
     cadre sur un écran étroit. */
  const debut = Math.max(0, position - Math.floor(LONGUEUR_EXTRAIT / 4));
  const espace = debut === 0 ? 0 : propre.indexOf(" ", debut);
  const depart = espace > 0 && espace < position ? espace + 1 : debut;

  const morceau = truncate(propre.slice(depart), LONGUEUR_EXTRAIT);
  return depart > 0 ? `… ${morceau}` : morceau;
}

/** Assemble une ligne mono en écartant ce qui n'est pas renseigné. */
const ligneMeta = (...parts: (string | null | undefined)[]): string | null => {
  const retenus = parts.filter((p): p is string => Boolean(p && p.trim()));
  return retenus.length > 0 ? retenus.join(" · ") : null;
};

/* -------------------------------------------------------------------------- */
/* Lecture                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Interroge les six fonds et rend leurs correspondances groupées.
 *
 * Les six lectures partent DE FRONT : aucune ne conditionne l'autre, et les
 * enchaîner ferait attendre le visiteur six fois pour rien.
 *
 * `type` restreint la recherche à un seul fonds. Le filtre est appliqué AVANT
 * les lectures et non après : inutile d'interroger cinq tables dont on jettera
 * les réponses.
 */
export async function rechercher(options: {
  lang: Lang;
  q: string;
  type?: TypeResultat | null;
}): Promise<Recherche> {
  const { lang } = options;
  const q = options.q.trim();
  if (q.length < MIN_CARACTERES) return { q, groupes: [], total: 0 };

  const veut = (type: TypeResultat) => !options.type || options.type === type;

  const groupes: GroupeResultats[] = [];

  /**
   * Filtrer par nature, c'est demander à voir CE fonds — pas ses six premières
   * lignes. Le plafond du groupe tombe donc, et le filtre devient la façon
   * d'atteindre tout ce qui a été trouvé, quel que soit le fonds.
   */
  const parGroupe = options.type ? PLAFOND : PAR_GROUPE;

  /** Cette même page, restreinte à un fonds. Le repli de `lienPlus`. */
  const lienType = (type: TypeResultat) =>
    `${route(lang, NAV.recherche)}?q=${encodeURIComponent(q)}&type=${type}`;

  /**
   * Range un fonds et lui choisit sa sortie.
   *
   * Une recherche DÉJÀ filtrée n'en propose aucune : le repli renverrait vers la
   * page où l'on se trouve, et le plafond est de toute façon levé, donc tout est
   * à l'écran.
   */
  const ranger = (type: TypeResultat, items: Resultat[], lienSection: string | null) =>
    ajouter(
      groupes,
      type,
      items,
      parGroupe,
      options.type ? null : (lienSection ?? lienType(type)),
    );

  const [actus, evenements, documents, albums, composantes, marches] = await Promise.all([
    veut("actu")
      ? listerActualites({ lang, recherche: q, parPage: PLAFOND, page: 1 }).then((l) => l.items)
      : Promise.resolve([]),
    veut("evenement")
      ? listerEvenements({ lang, recherche: q }).then((l) => [...l.aVenir, ...l.passes])
      : Promise.resolve([]),
    veut("publication")
      ? listerDocuments({ lang, recherche: q, limite: PLAFOND })
      : Promise.resolve([]),
    veut("album") ? listerAlbums(lang, { recherche: q, limite: PLAFOND }) : Promise.resolve([]),
    veut("composante") ? composantesPubliques(lang) : Promise.resolve([]),
    veut("marche") ? chargerMarches() : Promise.resolve([]),
  ]);

  /* --- Documents publiés -------------------------------------------------- */
  ranger(
    "publication",
    documents.map((doc) => ({
      cle: `publication:${doc.id}`,
      type: "publication" as const,
      titre: doc.titre,
      extrait: extraitAutour(doc.description || htmlToText(doc.contenu), q),
      chemin: doc.chemin,
      meta: ligneMeta(doc.typeLabel, doc.categorie?.nom, doc.reference, doc.version),
      dateLabel: doc.dateLabel,
      dateISO: doc.dateISO,
      surTitre: contient(doc.titre, q),
    })),
    `${route(lang, NAV.transparence)}?q=${encodeURIComponent(q)}`,
  );

  /* --- Communiqués -------------------------------------------------------- */
  ranger(
    "actu",
    actus.map((actu) => ({
      cle: `actu:${actu.id}`,
      type: "actu" as const,
      titre: actu.title,
      extrait: extraitAutour(actu.excerpt || htmlToText(actu.contentHtml), q),
      chemin: `${route(lang, NAV.actualites)}/${actu.slug}`,
      meta: ligneMeta(actu.categorie?.nom, actu.lieu),
      dateLabel: actu.dateLabel,
      dateISO: actu.dateISO,
      surTitre: contient(actu.title, q),
    })),
    `${route(lang, NAV.actualites)}?q=${encodeURIComponent(q)}`,
  );

  /* --- Composantes du Projet ----------------------------------------------
     Filtrées ici, sur les seuls champs qu'un visiteur tape : le code (« C2 »),
     les deux formulations du titre et le résumé. Le corps éditorial complet
     (chapeau, problématique, projets phares) est volontairement hors du champ :
     il ferait remonter les cinq composantes sur presque tous les mots, et une
     recherche dont chaque requête rend tout le référentiel n'aide personne. */
  const compsTrouvees = composantes.filter(
    (comp) =>
      contient(comp.code, q) ||
      contient(comp.titre, q) ||
      contient(comp.titreLong, q) ||
      contient(comp.desc, q),
  );
  ranger(
    "composante",
    compsTrouvees.map((comp) => ({
      cle: `composante:${comp.id}`,
      type: "composante" as const,
      titre: `${comp.code} · ${comp.titre}`,
      extrait: extraitAutour(comp.desc || comp.soustitre, q),
      chemin: `${route(lang, NAV.composantes)}/${comp.slug}`,
      meta: ligneMeta(comp.soustitre),
      dateLabel: null,
      dateISO: null,
      surTitre: contient(comp.code, q) || contient(comp.titre, q) || contient(comp.titreLong, q),
    })),
    null,
  );

  /* --- Avis de marché ------------------------------------------------------
     La référence d'un avis est le premier terme qu'un soumissionnaire tape, et
     souvent le seul : elle passe avant l'objet dans le test comme dans le tri. */
  const marchesTrouves = marches.filter(
    (m) =>
      contient(m.ref, q) ||
      contient(m.objet[lang], q) ||
      contient(m.resume[lang], q) ||
      contient(m.lieu[lang], q),
  );
  ranger(
    "marche",
    marchesTrouves.map((m) => ({
      cle: `marche:${m.ref}`,
      type: "marche" as const,
      titre: m.objet[lang],
      extrait: extraitAutour(m.resume[lang], q),
      /* `?avis=<référence>` déplie l'avis à l'ouverture de la page « Marchés »
         (cf. son composant de liste) : le visiteur atterrit sur la fiche, pas
         en haut d'un catalogue où il devrait la retrouver. */
      chemin: `${route(lang, NAV.marches)}?avis=${encodeURIComponent(m.ref)}`,
      meta: ligneMeta(m.ref, m.comp, m.lieu[lang]),
      dateLabel: null,
      dateISO: m.publieISO || null,
      surTitre: contient(m.ref, q) || contient(m.objet[lang], q),
    })),
    null,
  );

  /* --- Événements ---------------------------------------------------------- */
  ranger(
    "evenement",
    evenements.map((evt) => ({
      cle: `evenement:${evt.id}`,
      type: "evenement" as const,
      titre: evt.title,
      extrait: extraitAutour(evt.excerpt || htmlToText(evt.contentHtml), q),
      chemin: `${route(lang, NAV.evenements)}/${evt.slug}`,
      meta: ligneMeta(evt.categorie?.nom, evt.lieu),
      dateLabel: evt.dateLabel,
      dateISO: evt.startISO,
      surTitre: contient(evt.title, q),
    })),
    `${route(lang, NAV.evenements)}?q=${encodeURIComponent(q)}`,
  );

  /* --- Galeries ------------------------------------------------------------ */
  ranger(
    "album",
    albums.map((album) => ({
      cle: `album:${album.id}`,
      type: "album" as const,
      titre: album.titre,
      extrait: extraitAutour(album.description, q),
      chemin: `${route(lang, NAV.galerie)}/${album.slug}`,
      meta: ligneMeta(album.rubrique?.nom, album.lieu),
      dateLabel: album.dateLabel,
      dateISO: album.dateISO,
      surTitre: contient(album.titre, q),
    })),
    /* Pas de renvoi vers `/gallery?q=` : cette page filtre les VISUELS et masque
       son bandeau d'albums dès qu'une requête est posée. `ranger` retombe donc
       sur le filtre par nature de cette page-ci, qui les montre tous. */
    null,
  );

  return { q, groupes, total: groupes.reduce((n, g) => n + g.total, 0) };
}

/**
 * Range un fonds dans les résultats, ou l'omet s'il n'a rien trouvé.
 *
 * Appelée par `ranger`, qui lui fournit le plafond du moment et le repli de
 * `lienPlus` : le corps de `rechercher` n'a ainsi à nommer que ce qui distingue
 * un fonds d'un autre.
 *
 * L'ordre des appels dans `rechercher` fixe l'ordre des groupes à l'écran, et il
 * n'est pas alphabétique : il va de la pièce la plus durable et la plus souvent
 * cherchée — un document publié, un communiqué — vers la plus contextuelle. Un
 * groupe vide ne paraît jamais : un intertitre suivi de rien se lit comme une
 * panne du moteur, pas comme une absence de correspondance.
 *
 * Dans le groupe, une correspondance de TITRE passe devant. Le reste garde
 * l'ordre du fonds d'origine — date pour un communiqué, rang pour un document —
 * plutôt qu'un score inventé ici : c'est l'ordre que le visiteur retrouvera sur
 * la page de section, et deux classements différents pour les mêmes fiches
 * feraient douter du moteur.
 */
function ajouter(
  groupes: GroupeResultats[],
  type: TypeResultat,
  items: Resultat[],
  parGroupe: number,
  lienPlus: string | null,
): void {
  if (items.length === 0) return;

  const ordonnes = [...items].sort((a, b) => Number(b.surTitre) - Number(a.surTitre));

  groupes.push({
    type,
    items: ordonnes.slice(0, parGroupe),
    total: ordonnes.length,
    lienPlus: lienPlus && ordonnes.length > parGroupe ? lienPlus : null,
  });
}
