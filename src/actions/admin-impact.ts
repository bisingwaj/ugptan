"use server";

/**
 * Écritures du module « Histoires & impact ».
 *
 * ⚠️ INVARIANT : chaque action commence par `assertPermission("histoires")`. Le
 * proxy laisse passer les POST (rediriger un POST de server action casserait le
 * protocole Flight), la barrière d'autorisation est donc ici, et nulle part
 * ailleurs.
 *
 * ─── Un formulaire par langue ────────────────────────────────────────────────
 *
 * Même dispositif que les actualités et les événements, et pour la même raison :
 * la fiche et les traductions s'enregistrent SÉPARÉMENT.
 *
 *   · `enregistrerSectionAction`      → emplacement, gabarit, fond, ordre,
 *                                       reprise, bouton : ce qui appartient à la
 *                                       section, pas à une langue ;
 *   · `enregistrerSectionLangueAction`→ UNE langue de l'en-tête ;
 *   · `enregistrerItemAction`         → les réglages d'UNE entrée ;
 *   · `enregistrerItemLangueAction`   → UNE langue d'UNE entrée.
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
import { safeUrl } from "@/lib/html/sanitize";
import { slugify } from "@/lib/actus/slug";
import { revaliderImpact } from "@/lib/impact/cache";
import {
  isImpactEmplacement, isImpactLayout, isImpactStatut, isImpactTheme, itemTraduit,
  sectionTraduite, type ImpactLayout,
} from "@/lib/impact/statut";

/** État partagé par tous les formulaires du module. */
export type ImpactFormState = { error: string | null; ok: string | null };

const IMPACT_PATH = adminPath("/histoires");

/**
 * Nom des langues dans les messages rendus à l'utilisateur.
 *
 * Deux formes, parce que le mot qu'elles qualifient n'a pas le même genre :
 * « la version française », mais « l'en-tête français ». Une seule table
 * donnait « En-tête anglaise enregistré », faute visible en console.
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

/**
 * Adresse saisie dans un champ de lien.
 *
 * Deux formes admises, et une seule barrière. Un chemin interne (« /projet »)
 * passe tel quel : il est préfixé de la langue à l'affichage, et le faire
 * traverser `safeUrl` — qui n'accepte que des adresses complètes — le
 * refuserait. Tout le reste est filtré, donc un `javascript:` collé dans le
 * champ ne peut pas ressortir en attribut `href` sur la page publique.
 */
function lienInterneOuExterne(formData: FormData, key: string): string | null {
  const brut = texte(formData, key);
  if (!brut) return null;
  if (brut.startsWith("/") && !brut.startsWith("//") && !brut.startsWith("/\\")) return brut;
  return safeUrl(brut);
}

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

/** Date d'un jalon, saisie en `<input type="date">` à l'heure de Kinshasa. */
function lireDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T09:00:00+01:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/* -------------------------------------------------------------------------- */
/* Sections — fiche                                                            */
/* -------------------------------------------------------------------------- */

/** Champs de la fiche, communs à toutes les langues. */
function lireFicheSection(formData: FormData) {
  const limite = entier(formData, "limite");
  const sourceId = optionnel(texte(formData, "sourceId"));

  return {
    theme: (() => {
      const brut = texte(formData, "theme");
      return isImpactTheme(brut) ? brut : ("CLAIR" as const);
    })(),
    position: entier(formData, "position"),
    numero: optionnel(texte(formData, "numero")),
    compact: coche(formData, "compact"),
    grandTitre: coche(formData, "grandTitre"),
    ctaUrl: lienInterneOuExterne(formData, "ctaUrl"),
    sourceId,
    // Une limite négative n'a pas de sens et `0` vaut « toutes » : les deux se
    // rangent sur `null` plutôt que d'être stockées telles quelles.
    limite: limite > 0 ? limite : null,
  };
}

/**
 * Crée une section et sa PREMIÈRE langue.
 *
 * Une seule langue à la création : une section naît dans la langue où elle est
 * rédigée. Les autres versions s'ajoutent ensuite depuis la fiche.
 */
export async function creerSectionAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  const acteur = await assertPermission("histoires");

  const locale = lireLocale(formData);
  if (!locale) return { error: "Langue de rédaction inconnue.", ok: null };

  const emplacement = texte(formData, "emplacement");
  if (!isImpactEmplacement(emplacement)) return { error: "Emplacement inconnu.", ok: null };

  const layout = texte(formData, "layout");
  if (!isImpactLayout(layout)) return { error: "Gabarit inconnu.", ok: null };

  const statut = texte(formData, "status");
  if (!isImpactStatut(statut)) return { error: "État inconnu.", ok: null };

  const entete = lireEnteteSection(formData);
  if (!sectionTraduite(entete)) {
    return { error: "Renseignez au moins un libellé de section ou un titre.", ok: null };
  }

  // La clé n'est jamais affichée : elle sert d'ancrage stable à l'amorçage et
  // aux renvois. Dérivée du titre pour rester lisible en base, suffixée si
  // besoin — deux sections peuvent légitimement porter le même titre.
  const base = slugify(entete.titre || entete.kicker || emplacement.toLowerCase()) || "section";
  const key = await cleUnique(base);

  const section = await db().impactSection.create({
    data: {
      ...lireFicheSection(formData),
      key,
      emplacement,
      layout,
      status: statut,
      createdById: acteur.id,
      translations: { create: [{ locale, ...entete }] },
    },
    select: { id: true },
  });

  revaliderImpact();
  // redirect() lève NEXT_REDIRECT : appelé en dernier, hors de tout try/catch.
  redirect(`${IMPACT_PATH}/${section.id}?cree=1`);
}

/** Clé libre, en suffixant tant qu'elle est prise. */
async function cleUnique(base: string): Promise<string> {
  const prises = new Set(
    (await db().impactSection.findMany({
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

export async function enregistrerSectionAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  await assertPermission("histoires");

  const id = texte(formData, "id");
  if (!id) return { error: "Section introuvable.", ok: null };

  const emplacement = texte(formData, "emplacement");
  if (!isImpactEmplacement(emplacement)) return { error: "Emplacement inconnu.", ok: null };

  const layout = texte(formData, "layout");
  if (!isImpactLayout(layout)) return { error: "Gabarit inconnu.", ok: null };

  const statut = texte(formData, "status");
  if (!isImpactStatut(statut)) return { error: "État inconnu.", ok: null };

  const section = await db().impactSection.findUnique({
    where: { id },
    select: {
      id: true,
      translations: { select: { kicker: true, titre: true } },
      _count: { select: { items: true } },
    },
  });
  if (!section) return { error: "Section introuvable.", ok: null };

  const fiche = lireFicheSection(formData);

  // Une section ne peut pas se reprendre elle-même : la lecture irait chercher
  // les entrées de la source, et la source n'en aurait pas.
  if (fiche.sourceId === id) {
    return { error: "Une section ne peut pas reprendre ses propres entrées.", ok: null };
  }

  if (fiche.sourceId) {
    const source = await db().impactSection.findUnique({
      where: { id: fiche.sourceId },
      select: { sourceId: true, layout: true },
    });
    if (!source) return { error: "La section source est introuvable.", ok: null };
    if (source.sourceId) {
      return {
        error: "La section choisie reprend elle-même une autre section : choisissez celle qui porte réellement les entrées.",
        ok: null,
      };
    }
    // Les gabarits doivent concorder : afficher des jalons avec le dessin des
    // témoignages laisserait des cartes sans portrait ni citation.
    if (source.layout !== layout) {
      return {
        error: "La section source n'a pas le même gabarit : ses entrées ne portent pas les champs attendus ici.",
        ok: null,
      };
    }
  }

  // La complétude se lit EN BASE et non dans le formulaire : cet envoi ne porte
  // aucune langue, et l'état des traductions a pu changer depuis l'affichage.
  if (statut === "PUBLISHED" && !section.translations.some(sectionTraduite)) {
    return {
      error: "Aucune langue renseignée : ajoutez un libellé ou un titre dans au moins une langue avant de publier.",
      ok: null,
    };
  }

  if (statut === "PUBLISHED" && !fiche.sourceId && section._count.items === 0) {
    return {
      error: "Cette section n'a aucune entrée : ajoutez-en une, ou reprenez celles d'une autre section.",
      ok: null,
    };
  }

  await db().impactSection.update({
    where: { id },
    data: { ...fiche, emplacement, layout, status: statut },
  });

  revalidatePath(`${IMPACT_PATH}/${id}`);
  revalidatePath(IMPACT_PATH);
  revaliderImpact();
  return { error: null, ok: "Réglages enregistrés." };
}

/* -------------------------------------------------------------------------- */
/* Sections — traductions                                                      */
/* -------------------------------------------------------------------------- */

function lireEnteteSection(formData: FormData) {
  return {
    kicker: optionnel(texte(formData, "kicker")),
    titre: optionnel(texte(formData, "titre")),
    lead: optionnel(texte(formData, "lead")),
    ctaLabel: optionnel(texte(formData, "ctaLabel")),
  };
}

/** Enregistre UNE langue de l'en-tête, et elle seule. */
export async function enregistrerSectionLangueAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  await assertPermission("histoires");

  const sectionId = texte(formData, "sectionId");
  const locale = lireLocale(formData);
  if (!sectionId) return { error: "Section introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const section = await db().impactSection.findUnique({ where: { id: sectionId }, select: { id: true } });
  if (!section) return { error: "Section introuvable.", ok: null };

  const entete = lireEnteteSection(formData);
  if (!sectionTraduite(entete)) {
    return {
      error: "Renseignez un libellé ou un titre. Pour retirer cette langue, utilisez « Supprimer cette traduction ».",
      ok: null,
    };
  }

  await db().impactSectionTranslation.upsert({
    where: { sectionId_locale: { sectionId, locale } },
    update: entete,
    create: { sectionId, locale, ...entete },
  });

  revalidatePath(`${IMPACT_PATH}/${sectionId}`);
  revaliderImpact();
  return { error: null, ok: `En-tête ${LANGUE_LABEL_M[locale]} enregistré.` };
}

/**
 * Retire une langue de l'en-tête.
 *
 * C'est le seul geste qui fait disparaître la section d'une version du site.
 * Refusé s'il ne reste qu'elle sur une section publiée : la page n'aurait plus
 * rien à servir dans aucune langue.
 */
export async function supprimerSectionLangueAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  await assertPermission("histoires");

  const sectionId = texte(formData, "sectionId");
  const locale = lireLocale(formData);
  if (!sectionId || !locale) return { error: "Traduction introuvable.", ok: null };

  const section = await db().impactSection.findUnique({
    where: { id: sectionId },
    select: { status: true, translations: { select: { locale: true } } },
  });
  if (!section) return { error: "Section introuvable.", ok: null };

  const autres = section.translations.filter((t) => t.locale !== locale);
  if (section.status === "PUBLISHED" && autres.length === 0) {
    return {
      error: "C'est la seule langue de cette section publiée : dépubliez-la d'abord, ou ajoutez une autre langue.",
      ok: null,
    };
  }

  await db().impactSectionTranslation.deleteMany({ where: { sectionId, locale } });

  revalidatePath(`${IMPACT_PATH}/${sectionId}`);
  revaliderImpact();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} supprimée.` };
}

/* -------------------------------------------------------------------------- */
/* Sections — actions rapides                                                  */
/* -------------------------------------------------------------------------- */

export async function basculerSectionAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  await assertPermission("histoires");

  const id = texte(formData, "id");
  if (!id) return { error: "Section introuvable.", ok: null };

  const section = await db().impactSection.findUnique({
    where: { id },
    select: {
      status: true, sourceId: true,
      translations: { select: { kicker: true, titre: true } },
      _count: { select: { items: true } },
    },
  });
  if (!section) return { error: "Section introuvable.", ok: null };

  const enLigne = section.status === "PUBLISHED";

  if (!enLigne) {
    if (!section.translations.some(sectionTraduite)) {
      return { error: "Aucune langue renseignée : ajoutez un libellé ou un titre avant de publier.", ok: null };
    }
    if (!section.sourceId && section._count.items === 0) {
      return { error: "Cette section n'a aucune entrée à afficher.", ok: null };
    }
  }

  await db().impactSection.update({ where: { id }, data: { status: enLigne ? "DRAFT" : "PUBLISHED" } });

  // ⚠️ La FICHE de la console est revalidée, pas seulement le site public : le
  // sélecteur « État » des réglages vit sur la même page que ce bouton et se
  // recale sur la prop (même correction que côté événements).
  revalidatePath(`${IMPACT_PATH}/${id}`);
  revalidatePath(IMPACT_PATH);
  revaliderImpact();
  return { error: null, ok: enLigne ? "Section retirée du site." : "Section publiée." };
}

/**
 * Duplication : la copie repart en brouillon, au même emplacement. C'est le
 * geste de l'essai — reprendre une grille qui fonctionne pour en tenter une
 * variante sans toucher à celle qui est en ligne.
 */
export async function dupliquerSectionAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  const acteur = await assertPermission("histoires");

  const id = texte(formData, "id");
  if (!id) return { error: "Section introuvable.", ok: null };

  const source = await db().impactSection.findUnique({
    where: { id },
    include: { translations: true, items: { include: { translations: true }, orderBy: { position: "asc" } } },
  });
  if (!source) return { error: "Section introuvable.", ok: null };

  const copie = await db().impactSection.create({
    data: {
      key: await cleUnique(`${source.key}-copie`),
      emplacement: source.emplacement,
      layout: source.layout,
      theme: source.theme,
      status: "DRAFT",
      position: source.position,
      numero: source.numero,
      compact: source.compact,
      grandTitre: source.grandTitre,
      ctaUrl: source.ctaUrl,
      sourceId: source.sourceId,
      limite: source.limite,
      createdById: acteur.id,
      translations: {
        create: source.translations
          .filter((tr) => (LOCALES as string[]).includes(tr.locale))
          .map((tr) => ({
            locale: tr.locale,
            kicker: tr.kicker,
            titre: tr.titre ? `${tr.titre} (copie)` : null,
            lead: tr.lead,
            ctaLabel: tr.ctaLabel,
          })),
      },
      items: {
        create: source.items.map((item, index) => ({
          position: index,
          status: item.status,
          featured: item.featured,
          valeur: item.valeur,
          color: item.color,
          videoYt: item.videoYt,
          lienUrl: item.lienUrl,
          dateAt: item.dateAt,
          coverMediaId: item.coverMediaId,
          coverKey: item.coverKey,
          translations: {
            create: item.translations
              .filter((tr) => (LOCALES as string[]).includes(tr.locale))
              .map((tr) => ({
                locale: tr.locale,
                surtitre: tr.surtitre,
                titre: tr.titre,
                texte: tr.texte,
                texteSecondaire: tr.texteSecondaire,
                lienLabel: tr.lienLabel,
                mediaAlt: tr.mediaAlt,
              })),
          },
        })),
      },
    },
    select: { id: true },
  });

  revaliderImpact();
  redirect(`${IMPACT_PATH}/${copie.id}?copie=1`);
}

export async function supprimerSectionAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  await assertPermission("histoires");

  const id = texte(formData, "id");
  if (!id) return { error: "Section introuvable.", ok: null };

  const section = await db().impactSection.findUnique({
    where: { id },
    select: { id: true, _count: { select: { reprises: true } } },
  });
  if (!section) return { error: "Section introuvable.", ok: null };

  // Une section reprise ailleurs ne se supprime pas en silence : `SetNull`
  // laisserait la section qui la reprend sans entrées, donc invisible, sans que
  // rien n'explique pourquoi.
  if (section._count.reprises > 0) {
    return {
      error: `Cette section fournit ses entrées à ${section._count.reprises} autre(s) section(s). Détachez-les d'abord.`,
      ok: null,
    };
  }

  // Entrées et traductions tombent en cascade (cf. schéma).
  await db().impactSection.delete({ where: { id } });

  revaliderImpact();
  redirect(`${IMPACT_PATH}?supprime=1`);
}

/* -------------------------------------------------------------------------- */
/* Entrées                                                                     */
/* -------------------------------------------------------------------------- */

/** Ajoute une entrée vide en fin de section, prête à être renseignée. */
export async function ajouterItemAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  await assertPermission("histoires");

  const sectionId = texte(formData, "sectionId");
  if (!sectionId) return { error: "Section introuvable.", ok: null };

  const section = await db().impactSection.findUnique({
    where: { id: sectionId },
    select: { sourceId: true, items: { select: { position: true }, orderBy: { position: "desc" }, take: 1 } },
  });
  if (!section) return { error: "Section introuvable.", ok: null };
  if (section.sourceId) {
    return {
      error: "Cette section reprend les entrées d'une autre : ajoutez l'entrée dans la section source.",
      ok: null,
    };
  }

  await db().impactItem.create({
    data: {
      sectionId,
      // En fin de liste, et non en tête : on ajoute à la suite de ce qui existe.
      position: (section.items[0]?.position ?? -1) + 1,
      status: "DRAFT",
    },
  });

  revalidatePath(`${IMPACT_PATH}/${sectionId}`);
  return { error: null, ok: "Entrée ajoutée. Renseignez-la puis affichez-la." };
}

/** Réglages non linguistiques d'UNE entrée. */
export async function enregistrerItemAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  await assertPermission("histoires");

  const id = texte(formData, "id");
  if (!id) return { error: "Entrée introuvable.", ok: null };

  const statut = texte(formData, "status");
  if (!isImpactStatut(statut)) return { error: "État inconnu.", ok: null };

  const item = await db().impactItem.findUnique({
    where: { id },
    select: {
      sectionId: true,
      section: { select: { layout: true } },
      translations: { select: { surtitre: true, titre: true, texte: true, texteSecondaire: true } },
    },
  });
  if (!item) return { error: "Entrée introuvable.", ok: null };

  const layout = item.section.layout as ImpactLayout;

  // Afficher une entrée qu'aucune langue ne sait rendre laisserait un trou dans
  // la grille : le refus se prononce sur la base relue, pas sur ce formulaire,
  // qui ne porte aucun texte.
  if (statut === "PUBLISHED" && !item.translations.some((tr) => itemTraduit(layout, tr))) {
    return {
      error: "Aucune langue complète : renseignez les champs de l'entrée avant de l'afficher.",
      ok: null,
    };
  }

  const coverMediaId = optionnel(texte(formData, "coverMediaId"));

  await db().impactItem.update({
    where: { id },
    data: {
      position: entier(formData, "position"),
      status: statut,
      featured: coche(formData, "featured"),
      valeur: optionnel(texte(formData, "valeur")),
      color: lireCouleur(texte(formData, "color")),
      videoYt: optionnel(texte(formData, "videoYt")),
      lienUrl: lienInterneOuExterne(formData, "lienUrl"),
      dateAt: lireDate(texte(formData, "dateAt")),
      coverMediaId,
      // Un visuel de la bibliothèque prime sur une clé du registre : conserver
      // les deux laisserait deux sources de vérité pour une seule image.
      coverKey: coverMediaId ? null : optionnel(texte(formData, "coverKey")),
    },
  });

  revalidatePath(`${IMPACT_PATH}/${item.sectionId}`);
  revaliderImpact();
  return { error: null, ok: "Entrée enregistrée." };
}

/** Enregistre UNE langue d'UNE entrée, et elle seule. */
export async function enregistrerItemLangueAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  await assertPermission("histoires");

  const itemId = texte(formData, "itemId");
  const locale = lireLocale(formData);
  if (!itemId) return { error: "Entrée introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const item = await db().impactItem.findUnique({
    where: { id: itemId },
    select: { sectionId: true, section: { select: { layout: true } } },
  });
  if (!item) return { error: "Entrée introuvable.", ok: null };

  const textes = {
    surtitre: optionnel(texte(formData, "surtitre")),
    titre: optionnel(texte(formData, "titre")),
    texte: optionnel(texte(formData, "texte")),
    texteSecondaire: optionnel(texte(formData, "texteSecondaire")),
    lienLabel: optionnel(texte(formData, "lienLabel")),
    mediaAlt: optionnel(texte(formData, "mediaAlt")),
  };

  const layout = item.section.layout as ImpactLayout;
  const complete = itemTraduit(layout, textes);

  // Une ligne entièrement vide n'est pas une traduction : l'enregistrer ferait
  // annoncer « traduit » à la console pour une langue qui n'affiche rien.
  if (!complete && Object.values(textes).every((valeur) => valeur === null)) {
    return {
      error: "Rien à enregistrer. Pour retirer cette langue, utilisez « Supprimer cette traduction ».",
      ok: null,
    };
  }

  await db().impactItemTranslation.upsert({
    where: { itemId_locale: { itemId, locale } },
    update: textes,
    create: { itemId, locale, ...textes },
  });

  revalidatePath(`${IMPACT_PATH}/${item.sectionId}`);
  revaliderImpact();

  const incomplete = complete
    ? ""
    : " Des champs requis restent vides : cette langue ne sera pas servie au public.";
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} enregistrée.${incomplete}` };
}

export async function supprimerItemLangueAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  await assertPermission("histoires");

  const itemId = texte(formData, "itemId");
  const locale = lireLocale(formData);
  if (!itemId || !locale) return { error: "Traduction introuvable.", ok: null };

  const item = await db().impactItem.findUnique({
    where: { id: itemId },
    select: { sectionId: true },
  });
  if (!item) return { error: "Entrée introuvable.", ok: null };

  await db().impactItemTranslation.deleteMany({ where: { itemId, locale } });

  revalidatePath(`${IMPACT_PATH}/${item.sectionId}`);
  revaliderImpact();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} supprimée.` };
}

/**
 * Déplacement d'une entrée d'un rang.
 *
 * Les deux positions sont ÉCHANGÉES, plutôt qu'incrémentées : deux entrées
 * créées à la suite peuvent porter la même position (import, duplication), et
 * un simple `position - 1` les ferait alors passer l'une devant l'autre sans
 * jamais les départager.
 */
export async function deplacerItemAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  await assertPermission("histoires");

  const id = texte(formData, "id");
  const sens = texte(formData, "sens");
  if (!id) return { error: "Entrée introuvable.", ok: null };
  if (sens !== "haut" && sens !== "bas") return { error: "Sens de déplacement inconnu.", ok: null };

  const item = await db().impactItem.findUnique({
    where: { id },
    select: { id: true, position: true, sectionId: true },
  });
  if (!item) return { error: "Entrée introuvable.", ok: null };

  const freres = await db().impactItem.findMany({
    where: { sectionId: item.sectionId },
    select: { id: true, position: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  const index = freres.findIndex((frere) => frere.id === id);
  const cible = sens === "haut" ? index - 1 : index + 1;
  if (index < 0 || cible < 0 || cible >= freres.length) {
    return { error: null, ok: null };
  }

  // Les positions sont réécrites sur toute la liste : c'est le seul moyen
  // d'obtenir un rangement strict quand plusieurs entrées partagent un rang.
  const ordre = [...freres];
  const [deplace] = ordre.splice(index, 1);
  ordre.splice(cible, 0, deplace);

  await db().$transaction(
    ordre.map((frere, rang) =>
      db().impactItem.update({ where: { id: frere.id }, data: { position: rang } }),
    ),
  );

  revalidatePath(`${IMPACT_PATH}/${item.sectionId}`);
  revaliderImpact();
  return { error: null, ok: null };
}

export async function supprimerItemAction(
  _prev: ImpactFormState,
  formData: FormData,
): Promise<ImpactFormState> {
  await assertPermission("histoires");

  const id = texte(formData, "id");
  if (!id) return { error: "Entrée introuvable.", ok: null };

  const item = await db().impactItem.findUnique({ where: { id }, select: { sectionId: true } });
  if (!item) return { error: "Entrée introuvable.", ok: null };

  try {
    await db().impactItem.delete({ where: { id } });
  } catch (error) {
    if (estDoublon(error)) return { error: "Suppression impossible.", ok: null };
    throw error;
  }

  revalidatePath(`${IMPACT_PATH}/${item.sectionId}`);
  revaliderImpact();
  return { error: null, ok: "Entrée supprimée." };
}
