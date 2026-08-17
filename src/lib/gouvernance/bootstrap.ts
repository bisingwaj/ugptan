/**
 * Amorçage du module « Gouvernance ».
 *
 * Reprend le contenu d'origine de la page — les trois organes, leur
 * composition et la chronique de leurs décisions — à la première ouverture de
 * l'écran, pour que la bascule ne vide pas une page publique en attendant que
 * quelqu'un la ressaisisse.
 *
 * Même contrat que les autres modules : la reprise se fait LIGNE PAR LIGNE, sur
 * la seule absence de la clé en base. Un organe supprimé par un administrateur
 * ne revient pas, sa clé étant réputée traitée dès lors qu'elle a été créée une
 * fois.
 *
 * Les écritures sont GROUPÉES d'emblée : la leçon du module « Le projet », dont
 * la reprise ligne à ligne tenait l'écran quatre minutes
 * (cf. lib/projet/bootstrap.ts).
 *
 * Ne lève jamais : l'écran du module doit s'afficher même base indisponible.
 */
import { gouvActivites } from "@/content/carbon";
import { db } from "@/lib/db";
import { describeError } from "@/lib/errors";
import { organesOrigine } from "@/lib/gouvernance/origine";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";

let organesAmorces = false;
let activitesAmorcees = false;

/** Les deux langues servies, d'un coup. */
const parLangue = <T,>(resoudre: (lang: Lang) => T): { locale: Lang; valeurs: T }[] =>
  LOCALES.map((locale) => ({ locale, valeurs: resoudre(locale) }));

/* -------------------------------------------------------------------------- */
/* Organes                                                                     */
/* -------------------------------------------------------------------------- */

export async function ensureOrganes(): Promise<void> {
  if (organesAmorces) return;

  try {
    const existants = await db().organe.findMany({ select: { key: true } });
    const prises = new Set(existants.map((row) => row.key));

    // Le contenu d'origine résolu dans les deux langues, une fois pour toutes.
    const origine = parLangue(organesOrigine);
    const reference = origine[0].valeurs;
    const aCreer = reference
      .map((organe, position) => ({ organe, position }))
      .filter(({ organe }) => !prises.has(organe.sigle));

    if (aCreer.length > 0) {
      const crees = await db().organe.createManyAndReturn({
        data: aCreer.map(({ organe, position }) => ({
          key: organe.sigle,
          sigle: organe.sigle,
          status: "PUBLISHED" as const,
          position,
        })),
        select: { id: true },
      });

      /* `createManyAndReturn` rend les lignes DANS L'ORDRE des données
         fournies : c'est ce qui permet d'apparier chaque identifiant à
         l'organe qui l'a produit sans clé de corrélation. */
      await db().organeTranslation.createMany({
        data: crees.flatMap((ligne, rang) =>
          origine.map(({ locale, valeurs }) => {
            const organe = valeurs[aCreer[rang].position];
            return {
              organeId: ligne.id,
              locale,
              nom: organe.nom,
              nature: organe.nature,
              effectif: organe.effectif,
              presidence: organe.presidence,
              decision: organe.decision,
              frequence: organe.frequence,
              composition: organe.composition,
              membres: organe.membres,
            };
          }),
        ),
      });
    }

    organesAmorces = true;
    if (aCreer.length > 0) {
      console.info(`[gouvernance] ${aCreer.length} organe(s) repris depuis le contenu d'origine du site.`);
    }
  } catch (error) {
    console.error(`[gouvernance] Amorçage des organes impossible : ${describeError(error)}`);
  }
}

/* -------------------------------------------------------------------------- */
/* Chronique des décisions                                                     */
/* -------------------------------------------------------------------------- */

export async function ensureActivites(): Promise<void> {
  if (activitesAmorcees) return;

  try {
    const existantes = await db().gouvActivite.findMany({ select: { key: true } });
    const prises = new Set(existantes.map((row) => row.key));

    const aCreer = gouvActivites
      .map((activite, position) => ({ activite, position, key: `ACT-${position + 1}` }))
      .filter(({ key }) => !prises.has(key));

    if (aCreer.length > 0) {
      const crees = await db().gouvActivite.createManyAndReturn({
        data: aCreer.map(({ activite, position, key }) => ({
          key,
          status: "PUBLISHED" as const,
          position,
          org: activite.org,
          color: activite.color,
        })),
        select: { id: true },
      });

      await db().gouvActiviteTranslation.createMany({
        data: crees.flatMap((ligne, rang) =>
          LOCALES.map((locale: Lang) => {
            const { activite } = aCreer[rang];
            return {
              activiteId: ligne.id,
              locale,
              dateLabel: pick(activite.date, locale),
              titre: pick(activite.titre, locale),
              note: pick(activite.note, locale),
            };
          }),
        ),
      });
    }

    activitesAmorcees = true;
    if (aCreer.length > 0) {
      console.info(`[gouvernance] ${aCreer.length} décision(s) reprises depuis le contenu d'origine du site.`);
    }
  } catch (error) {
    console.error(`[gouvernance] Amorçage de la chronique impossible : ${describeError(error)}`);
  }
}
