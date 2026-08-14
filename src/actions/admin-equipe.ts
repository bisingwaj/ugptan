"use server";

/**
 * Écritures du module « L'équipe de l'Unité ».
 *
 * ⚠️ INVARIANT : chaque action commence par `assertPermission("equipe")`. Le
 * proxy laisse passer les POST (rediriger un POST de server action casserait le
 * protocole Flight), la barrière d'autorisation est donc ici, et nulle part
 * ailleurs.
 *
 * ─── Un formulaire par langue ────────────────────────────────────────────────
 *
 * Même dispositif que les autres modules, et pour la même raison : la fiche et
 * les traductions s'enregistrent SÉPARÉMENT.
 *
 *   · `enregistrerMembreAction`       → portrait, pôle, ordre, mise en avant,
 *                                       composante : ce qui appartient à la
 *                                       fiche, pas à une langue ;
 *   · `enregistrerMembreLangueAction` → UNE langue de la fiche.
 *
 * Avec un envoi unique portant les deux langues, l'écran du traducteur
 * réécrirait AUSSI la langue d'origine telle qu'il l'a chargée : toute
 * correction faite entre-temps par le rédacteur serait écrasée sans que
 * personne ne le voie.
 *
 * Corollaire sur les noms de champs : ils ne sont PAS préfixés par la langue.
 * Le formulaire porte sa langue dans un champ `locale`.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/guard";
import { adminPath } from "@/lib/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { slugify } from "@/lib/actus/slug";
import { revaliderEquipe } from "@/lib/equipe/cache";
import { isTeamComposante, isTeamStatut } from "@/lib/equipe/statut";

/** État partagé par tous les formulaires du module. */
export type EquipeFormState = { error: string | null; ok: string | null };

const EQUIPE_PATH = adminPath("/equipe");
const POLES_PATH = adminPath("/equipe/poles");

/**
 * Nom des langues dans les messages rendus à l'utilisateur.
 *
 * Deux formes, parce que le mot qu'elles qualifient n'a pas le même genre :
 * « la version française », mais « le profil français ».
 */
const LANGUE_LABEL: Record<Lang, string> = { fr: "française", en: "anglaise" };
const LANGUE_LABEL_M: Record<Lang, string> = { fr: "français", en: "anglais" };

/** Code Prisma d'une violation de contrainte d'unicité. */
const UNIQUE_VIOLATION = "P2002";

const estDoublon = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;

/* -------------------------------------------------------------------------- */
/* Lecture du formulaire                                                       */
/* -------------------------------------------------------------------------- */

const texte = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();
const optionnel = (value: string): string | null => (value.length ? value : null);
const coche = (formData: FormData, key: string): boolean =>
  formData.get(key) === "on" || formData.get(key) === "1";

const entier = (formData: FormData, key: string): number => {
  const valeur = Number.parseInt(texte(formData, key), 10);
  return Number.isFinite(valeur) ? valeur : 0;
};

/** Couleur d'accent : hexadécimal à 6 chiffres, ou rien. */
function lireCouleur(value: string): string | null {
  const couleur = value.trim().toLowerCase();
  if (!couleur) return null;
  return /^#[0-9a-f]{6}$/.test(couleur) ? couleur : null;
}

/** Langue portée par le formulaire, ou `null` si elle n'est pas servie. */
function lireLocale(formData: FormData): Lang | null {
  const brut = texte(formData, "locale");
  return (LOCALES as string[]).includes(brut) ? (brut as Lang) : null;
}

/**
 * Adresse de contact publiée sur une fiche de composante.
 *
 * Contrôle volontairement sommaire — une adresse, une arobase, un point : il
 * s'agit d'écarter une saisie manifestement fautive, pas de valider une boîte
 * qui existe. Une adresse refusée ici ne bloque rien d'autre que son propre
 * champ.
 */
function lireEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

/* -------------------------------------------------------------------------- */
/* Fiches — champs communs                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Champs de la fiche, communs à toutes les langues.
 *
 * Le portrait accepte DEUX sources, et l'ordre compte : un média choisi dans la
 * bibliothèque l'emporte sur un chemin saisi à la main. Les fiches reprises de
 * la version statique du site portent un chemin (`/portraits/...`) ; dès qu'un
 * portrait est déposé depuis la console, il prend la place sans qu'il faille
 * vider l'ancien champ.
 */
function lireFicheMembre(formData: FormData) {
  const composante = texte(formData, "composante");
  const photoMediaId = optionnel(texte(formData, "photoMediaId"));

  return {
    nom: optionnel(texte(formData, "nom")),
    position: entier(formData, "position"),
    featured: coche(formData, "featured"),
    color: lireCouleur(texte(formData, "color")),
    email: lireEmail(texte(formData, "email")),
    composante: isTeamComposante(composante) ? composante : null,
    poleId: optionnel(texte(formData, "poleId")),
    photoMediaId,
    photoPath: photoMediaId ? null : optionnel(texte(formData, "photoPath")),
  };
}

/** Une langue de la fiche, telle qu'elle est saisie. */
function lireProfil(formData: FormData) {
  return {
    nom: optionnel(texte(formData, "trNom")),
    role: texte(formData, "role"),
    mandat: optionnel(texte(formData, "mandat")),
    bio: optionnel(texte(formData, "bio")),
    verbatim: optionnel(texte(formData, "verbatim")),
  };
}

/* -------------------------------------------------------------------------- */
/* Fiches — création                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Crée une fiche et sa PREMIÈRE langue.
 *
 * Une seule langue à la création : une fiche naît dans la langue où elle est
 * rédigée. Les autres versions s'ajoutent ensuite depuis la fiche.
 *
 * La position par défaut place la fiche EN FIN de grille, et non en tête : une
 * arrivée ne prend pas le pas sur la hiérarchie établie tant que personne ne
 * l'a décidé.
 */
export async function creerMembreAction(
  _prev: EquipeFormState,
  formData: FormData,
): Promise<EquipeFormState> {
  const acteur = await assertPermission("equipe");

  const locale = lireLocale(formData);
  if (!locale) return { error: "Langue de rédaction inconnue.", ok: null };

  const statut = texte(formData, "status");
  if (!isTeamStatut(statut)) return { error: "État inconnu.", ok: null };

  const profil = lireProfil(formData);
  if (!profil.role) return { error: "Renseignez la fonction : c'est le seul champ obligatoire.", ok: null };

  const fiche = lireFicheMembre(formData);

  // La clé n'est jamais affichée : elle sert d'ancrage stable à l'amorçage.
  // Dérivée du nom, à défaut de la fonction, et suffixée si besoin — deux
  // postes peuvent légitimement porter le même intitulé.
  const base = slugify(fiche.nom || profil.role) || "membre";
  const key = await cleUnique(base);

  const dernier = await db().teamMember.findFirst({
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const membre = await db().teamMember.create({
    data: {
      ...fiche,
      key,
      status: statut,
      position: fiche.position || (dernier ? dernier.position + 1 : 0),
      createdById: acteur.id,
      translations: { create: [{ locale, ...profil }] },
    },
    select: { id: true },
  });

  revaliderEquipe();
  // redirect() lève NEXT_REDIRECT : appelé en dernier, hors de tout try/catch.
  redirect(`${EQUIPE_PATH}/${membre.id}?cree=1`);
}

/** Clé libre, en suffixant tant qu'elle est prise. */
async function cleUnique(base: string): Promise<string> {
  const prises = new Set(
    (await db().teamMember.findMany({
      where: { key: { startsWith: base } },
      select: { key: true },
    })).map((row) => row.key),
  );

  if (!prises.has(base)) return base;
  for (let n = 2; n < 500; n += 1) {
    const candidat = `${base}-${n}`;
    if (!prises.has(candidat)) return candidat;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/* -------------------------------------------------------------------------- */
/* Fiches — modification                                                       */
/* -------------------------------------------------------------------------- */

export async function enregistrerMembreAction(
  _prev: EquipeFormState,
  formData: FormData,
): Promise<EquipeFormState> {
  await assertPermission("equipe");

  const id = texte(formData, "id");
  if (!id) return { error: "Fiche introuvable.", ok: null };

  const statut = texte(formData, "status");
  if (!isTeamStatut(statut)) return { error: "État inconnu.", ok: null };

  const existe = await db().teamMember.findUnique({ where: { id }, select: { id: true } });
  if (!existe) return { error: "Fiche introuvable.", ok: null };

  await db().teamMember.update({
    where: { id },
    data: { ...lireFicheMembre(formData), status: statut },
  });

  revalidatePath(`${EQUIPE_PATH}/${id}`);
  revaliderEquipe();
  return { error: null, ok: "Réglages enregistrés." };
}

/** Enregistre UNE langue de la fiche, et elle seule. */
export async function enregistrerMembreLangueAction(
  _prev: EquipeFormState,
  formData: FormData,
): Promise<EquipeFormState> {
  await assertPermission("equipe");

  const id = texte(formData, "id");
  if (!id) return { error: "Fiche introuvable.", ok: null };

  const locale = lireLocale(formData);
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const profil = lireProfil(formData);
  if (!profil.role) {
    return {
      error: `Renseignez la fonction : sans elle, la version ${LANGUE_LABEL[locale]} ne peut pas s'afficher.`,
      ok: null,
    };
  }

  const existe = await db().teamMember.findUnique({ where: { id }, select: { id: true } });
  if (!existe) return { error: "Fiche introuvable.", ok: null };

  await db().teamMemberTranslation.upsert({
    where: { memberId_locale: { memberId: id, locale } },
    create: { memberId: id, locale, ...profil },
    update: profil,
  });

  revalidatePath(`${EQUIPE_PATH}/${id}`);
  revaliderEquipe();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} enregistrée.` };
}

/**
 * Retire UNE langue d'une fiche.
 *
 * La dernière langue ne se retire pas : une fiche sans aucune traduction
 * n'aurait plus d'intitulé nulle part, et disparaîtrait du site sans que
 * personne l'ait masquée. Pour retirer la fiche, on supprime la fiche.
 */
export async function supprimerMembreLangueAction(
  _prev: EquipeFormState,
  formData: FormData,
): Promise<EquipeFormState> {
  await assertPermission("equipe");

  const id = texte(formData, "id");
  const locale = lireLocale(formData);
  if (!id) return { error: "Fiche introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const traductions = await db().teamMemberTranslation.findMany({
    where: { memberId: id },
    select: { locale: true },
  });

  if (traductions.length <= 1) {
    return { error: "C'est la dernière version de cette fiche. Supprimez la fiche elle-même.", ok: null };
  }

  await db().teamMemberTranslation.deleteMany({ where: { memberId: id, locale } });

  revalidatePath(`${EQUIPE_PATH}/${id}`);
  revaliderEquipe();
  return { error: null, ok: `Profil ${LANGUE_LABEL_M[locale]} retiré.` };
}

/** Publie ou masque une fiche depuis la liste, sans ouvrir l'écran d'édition. */
export async function basculerMembreAction(
  _prev: EquipeFormState,
  formData: FormData,
): Promise<EquipeFormState> {
  await assertPermission("equipe");

  const id = texte(formData, "id");
  if (!id) return { error: "Fiche introuvable.", ok: null };

  const membre = await db().teamMember.findUnique({
    where: { id },
    select: { status: true, translations: { select: { locale: true, role: true } } },
  });
  if (!membre) return { error: "Fiche introuvable.", ok: null };

  const publie = membre.status === "PUBLISHED";

  // Publier une fiche qu'aucune langue ne sert la ferait disparaître de la
  // grille sans rien dire : le refus est plus clair qu'un succès sans effet.
  if (!publie && !membre.translations.some((tr) => tr.role?.trim())) {
    return { error: "Renseignez la fonction dans au moins une langue avant de publier.", ok: null };
  }

  await db().teamMember.update({
    where: { id },
    data: { status: publie ? "DRAFT" : "PUBLISHED" },
  });

  revalidatePath(EQUIPE_PATH);
  revalidatePath(`${EQUIPE_PATH}/${id}`);
  revaliderEquipe();
  return { error: null, ok: publie ? "Fiche masquée." : "Fiche publiée." };
}

/**
 * Délai laissé à une transaction de réordonnancement.
 *
 * Le défaut de Prisma est de 5 s, et il ne tient pas ici : chaque `update`
 * traverse le WebSocket vers Neon, dont une poignée de main coûte déjà quelques
 * centaines de millisecondes (cf. src/instrumentation-node.ts). Douze écritures
 * séquentielles ont dépassé le plafond en conditions réelles — mesuré à 6341 ms
 * pour douze fiches, transaction annulée et déplacement perdu.
 *
 * Ce plafond n'ATTEND rien : une transaction qui se termine en 200 ms se
 * termine toujours en 200 ms. Il ne fait que cesser de couper une écriture
 * légitime au moment où elle allait aboutir.
 */
const DELAI_REORDONNANCEMENT_MS = 20_000;

/**
 * Réécrit les positions d'une liste réordonnée, en ne touchant QUE les lignes
 * qui changent réellement de rang.
 *
 * Réécrire toute la liste serait plus simple à lire, et c'est ce que faisait la
 * première version — mais cela coûtait autant d'allers-retours que d'éléments,
 * pour un déplacement qui n'en concerne que deux. Sur une liaison où chaque
 * écriture coûte une centaine de millisecondes, la différence est celle d'un
 * geste instantané et d'une transaction qui expire.
 *
 * La normalisation reste complète : les rangs écrits sont ceux de la liste
 * ordonnée, `0..n-1`. Si des positions étaient dégénérées — deux fiches au même
 * rang après un amorçage ou un import — ce sont toutes les lignes fautives qui
 * sont corrigées, et non les deux déplacées.
 */
async function reordonner(
  table: "teamMember" | "teamPole",
  ordre: readonly { id: string; position: number }[],
): Promise<void> {
  const aEcrire = ordre
    .map((ligne, rang) => ({ id: ligne.id, rang, actuelle: ligne.position }))
    .filter(({ rang, actuelle }) => actuelle !== rang);

  if (aEcrire.length === 0) return;

  const client = db();
  await client.$transaction(
    aEcrire.map(({ id, rang }) =>
      table === "teamMember"
        ? client.teamMember.update({ where: { id }, data: { position: rang } })
        : client.teamPole.update({ where: { id }, data: { position: rang } }),
    ),
    { timeout: DELAI_REORDONNANCEMENT_MS },
  );
}

/**
 * Déplacement d'une fiche d'un rang dans la grille.
 *
 * Les positions sont RECALCULÉES sur la liste entière, plutôt qu'incrémentées :
 * deux fiches créées à la suite peuvent porter la même position (amorçage,
 * import), et un simple `position - 1` les ferait alors passer l'une devant
 * l'autre sans jamais les départager. Seules les lignes dont le rang change
 * sont écrites (cf. `reordonner`).
 */
export async function deplacerMembreAction(
  _prev: EquipeFormState,
  formData: FormData,
): Promise<EquipeFormState> {
  await assertPermission("equipe");

  const id = texte(formData, "id");
  const sens = texte(formData, "sens");
  if (!id) return { error: "Fiche introuvable.", ok: null };
  if (sens !== "haut" && sens !== "bas") return { error: "Sens de déplacement inconnu.", ok: null };

  const membres = await db().teamMember.findMany({
    select: { id: true, position: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  const index = membres.findIndex((membre) => membre.id === id);
  const cible = sens === "haut" ? index - 1 : index + 1;
  if (index < 0 || cible < 0 || cible >= membres.length) {
    return { error: null, ok: null };
  }

  const ordre = [...membres];
  const [deplace] = ordre.splice(index, 1);
  ordre.splice(cible, 0, deplace);

  await reordonner("teamMember", ordre);

  revalidatePath(EQUIPE_PATH);
  revaliderEquipe();
  return { error: null, ok: null };
}

export async function supprimerMembreAction(
  _prev: EquipeFormState,
  formData: FormData,
): Promise<EquipeFormState> {
  await assertPermission("equipe");

  const id = texte(formData, "id");
  if (!id) return { error: "Fiche introuvable.", ok: null };

  const membre = await db().teamMember.findUnique({ where: { id }, select: { id: true } });
  if (!membre) return { error: "Fiche introuvable.", ok: null };

  // Les traductions partent avec la fiche (`onDelete: Cascade`). Le portrait,
  // lui, reste dans la bibliothèque : il peut servir ailleurs, et une
  // suppression en cascade d'un média partagé serait irréversible.
  await db().teamMember.delete({ where: { id } });

  revaliderEquipe();
  redirect(`${EQUIPE_PATH}?supprime=1`);
}

/* -------------------------------------------------------------------------- */
/* Pôles                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Crée un pôle avec ses deux langues d'un coup.
 *
 * Contrairement à une fiche, un pôle n'a qu'un nom et une mission d'une ligne :
 * demander deux passages pour deux libellés coûterait plus que de les saisir
 * ensemble. Une langue laissée vide n'est simplement pas créée.
 */
export async function creerPoleAction(
  _prev: EquipeFormState,
  formData: FormData,
): Promise<EquipeFormState> {
  await assertPermission("equipe");

  const nomFr = texte(formData, "nomFr");
  if (!nomFr) return { error: "Renseignez au moins le nom français du pôle.", ok: null };

  const nomEn = texte(formData, "nomEn");
  const missionFr = optionnel(texte(formData, "missionFr"));
  const missionEn = optionnel(texte(formData, "missionEn"));

  const dernier = await db().teamPole.findFirst({
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const traductions: { locale: Lang; nom: string; mission: string | null }[] = [
    { locale: "fr", nom: nomFr, mission: missionFr },
  ];
  if (nomEn) traductions.push({ locale: "en", nom: nomEn, mission: missionEn });

  try {
    await db().teamPole.create({
      data: {
        key: await clePoleUnique(slugify(nomFr) || "pole"),
        position: dernier ? dernier.position + 1 : 0,
        color: lireCouleur(texte(formData, "color")),
        translations: { create: traductions },
      },
      select: { id: true },
    });
  } catch (error) {
    if (estDoublon(error)) return { error: "Un pôle porte déjà ce nom.", ok: null };
    throw error;
  }

  revalidatePath(POLES_PATH);
  revaliderEquipe();
  return { error: null, ok: "Pôle créé." };
}

async function clePoleUnique(base: string): Promise<string> {
  const prises = new Set(
    (await db().teamPole.findMany({
      where: { key: { startsWith: base } },
      select: { key: true },
    })).map((row) => row.key),
  );

  if (!prises.has(base)) return base;
  for (let n = 2; n < 500; n += 1) {
    const candidat = `${base}-${n}`;
    if (!prises.has(candidat)) return candidat;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function enregistrerPoleAction(
  _prev: EquipeFormState,
  formData: FormData,
): Promise<EquipeFormState> {
  await assertPermission("equipe");

  const id = texte(formData, "id");
  if (!id) return { error: "Pôle introuvable.", ok: null };

  const nomFr = texte(formData, "nomFr");
  if (!nomFr) return { error: "Le nom français du pôle est obligatoire.", ok: null };

  const nomEn = texte(formData, "nomEn");
  const missionFr = optionnel(texte(formData, "missionFr"));
  const missionEn = optionnel(texte(formData, "missionEn"));

  const pole = await db().teamPole.findUnique({ where: { id }, select: { id: true } });
  if (!pole) return { error: "Pôle introuvable.", ok: null };

  await db().teamPole.update({
    where: { id },
    data: { color: lireCouleur(texte(formData, "color")) },
  });

  await db().teamPoleTranslation.upsert({
    where: { poleId_locale: { poleId: id, locale: "fr" } },
    create: { poleId: id, locale: "fr", nom: nomFr, mission: missionFr },
    update: { nom: nomFr, mission: missionFr },
  });

  // Un nom anglais effacé RETIRE la version anglaise, au lieu de la laisser
  // vide : le pôle disparaît alors de la grille anglaise, ce qui est plus franc
  // qu'un libellé français sur une page anglaise.
  if (nomEn) {
    await db().teamPoleTranslation.upsert({
      where: { poleId_locale: { poleId: id, locale: "en" } },
      create: { poleId: id, locale: "en", nom: nomEn, mission: missionEn },
      update: { nom: nomEn, mission: missionEn },
    });
  } else {
    await db().teamPoleTranslation.deleteMany({ where: { poleId: id, locale: "en" } });
  }

  revalidatePath(POLES_PATH);
  revaliderEquipe();
  return { error: null, ok: "Pôle enregistré." };
}

/**
 * Déplacement d'un pôle d'un rang. Même recalcul que pour les fiches, et mêmes
 * écritures minimales (cf. `reordonner`).
 */
export async function deplacerPoleAction(
  _prev: EquipeFormState,
  formData: FormData,
): Promise<EquipeFormState> {
  await assertPermission("equipe");

  const id = texte(formData, "id");
  const sens = texte(formData, "sens");
  if (!id) return { error: "Pôle introuvable.", ok: null };
  if (sens !== "haut" && sens !== "bas") return { error: "Sens de déplacement inconnu.", ok: null };

  const poles = await db().teamPole.findMany({
    select: { id: true, position: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  const index = poles.findIndex((pole) => pole.id === id);
  const cible = sens === "haut" ? index - 1 : index + 1;
  if (index < 0 || cible < 0 || cible >= poles.length) {
    return { error: null, ok: null };
  }

  const ordre = [...poles];
  const [deplace] = ordre.splice(index, 1);
  ordre.splice(cible, 0, deplace);

  await reordonner("teamPole", ordre);

  revalidatePath(POLES_PATH);
  revaliderEquipe();
  return { error: null, ok: null };
}

/**
 * Supprime un pôle.
 *
 * Les fiches rattachées ne partent pas avec lui (`onDelete: SetNull`) : elles
 * perdent leur pôle et restent en ligne, sans la ligne qui le nommait. Un pôle
 * encore peuplé est donc refusé — non parce que la base l'interdit, mais parce
 * que la conséquence serait invisible depuis cet écran.
 */
export async function supprimerPoleAction(
  _prev: EquipeFormState,
  formData: FormData,
): Promise<EquipeFormState> {
  await assertPermission("equipe");

  const id = texte(formData, "id");
  if (!id) return { error: "Pôle introuvable.", ok: null };

  const pole = await db().teamPole.findUnique({
    where: { id },
    select: { _count: { select: { membres: true } } },
  });
  if (!pole) return { error: "Pôle introuvable.", ok: null };

  if (pole._count.membres > 0) {
    const n = pole._count.membres;
    return {
      error: `Ce pôle porte encore ${n} fiche${n > 1 ? "s" : ""}. Rattachez-les ailleurs avant de le supprimer.`,
      ok: null,
    };
  }

  await db().teamPole.delete({ where: { id } });

  revalidatePath(POLES_PATH);
  revaliderEquipe();
  return { error: null, ok: "Pôle supprimé." };
}
