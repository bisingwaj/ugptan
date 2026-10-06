/**
 * Amorçage du module « Provinces ».
 *
 * Reprend les 26 fiches et les projets d'origine (content/provinces-fiches.ts,
 * content/provinces-projets.ts) à la première ouverture de l'écran, pour que
 * la bascule en base ne vide pas les pages publiques.
 *
 * Même contrat que les autres modules (cf. lib/gouvernance/bootstrap.ts) :
 * reprise LIGNE PAR LIGNE sur la seule absence de la clé, écritures groupées,
 * et une ligne supprimée par un administrateur ne revient pas. Ne lève jamais.
 */
import { db } from "@/lib/db";
import { describeError } from "@/lib/errors";
import { LOCALES } from "@/lib/params";
import { pick } from "@/lib/pick";
import { provincesFiches } from "@/content/provinces-fiches";
import { provincesProjets } from "@/content/provinces-projets";

let fichesAmorcees = false;
let projetsAmorces = false;

export async function ensureFiches(): Promise<void> {
  if (fichesAmorcees) return;

  try {
    const existantes = await db().provinceFiche.findMany({ select: { slug: true } });
    const prises = new Set(existantes.map((row) => row.slug));
    const aCreer = provincesFiches.filter((fiche) => !prises.has(fiche.slug));

    if (aCreer.length > 0) {
      const creees = await db().provinceFiche.createManyAndReturn({
        data: aCreer.map((fiche) => ({
          slug: fiche.slug,
          status: "PUBLISHED" as const,
          chefLieu: fiche.chefLieu,
          superficieKm2: fiche.superficieKm2,
          population: fiche.population,
          populationAnnee: fiche.populationAnnee,
          populationSource: fiche.populationSource,
          territoires: fiche.territoires,
          communes: fiche.communes,
          villes: fiche.villes,
          gouverneur: fiche.gouverneur,
          viceGouverneur: fiche.viceGouverneur,
          gouverneurDate: fiche.gouverneurDate ? new Date(fiche.gouverneurDate) : null,
          gouverneurSource: fiche.gouverneurSource,
          langues: fiche.langues,
          sources: fiche.sources,
        })),
        select: { id: true },
      });

      // `createManyAndReturn` rend les lignes dans l'ordre des données fournies.
      await db().provinceFicheTranslation.createMany({
        data: creees.flatMap((ligne, rang) =>
          LOCALES.map((locale) => ({
            ficheId: ligne.id,
            locale,
            description: pick(aCreer[rang].description, locale),
            administration: aCreer[rang].administration ? pick(aCreer[rang].administration!, locale) : null,
          })),
        ),
      });
    }

    fichesAmorcees = true;
    if (aCreer.length > 0) console.info(`[provinces] ${aCreer.length} fiche(s) reprise(s) du contenu d'origine.`);
  } catch (error) {
    console.error(`[provinces] Amorçage des fiches impossible : ${describeError(error)}`);
  }
}

export async function ensureProjets(): Promise<void> {
  if (projetsAmorces) return;

  try {
    const existants = await db().provinceProjet.findMany({ select: { key: true } });
    const prises = new Set(existants.map((row) => row.key));
    const aCreer = provincesProjets
      .map((projet, position) => ({ projet, position }))
      .filter(({ projet }) => !prises.has(projet.key));

    if (aCreer.length > 0) {
      const crees = await db().provinceProjet.createManyAndReturn({
        data: aCreer.map(({ projet, position }) => ({
          key: projet.key,
          status: "PUBLISHED" as const,
          avancement: projet.avancement,
          position,
          composante: projet.composante,
          odd: projet.odd,
          provinces: projet.provinces,
        })),
        select: { id: true },
      });

      await db().provinceProjetTranslation.createMany({
        data: crees.flatMap((ligne, rang) =>
          LOCALES.map((locale) => ({
            projetId: ligne.id,
            locale,
            titre: pick(aCreer[rang].projet.titre, locale),
            resume: pick(aCreer[rang].projet.resume, locale),
          })),
        ),
      });
    }

    projetsAmorces = true;
    if (aCreer.length > 0) console.info(`[provinces] ${aCreer.length} projet(s) repris du contenu d'origine.`);
  } catch (error) {
    console.error(`[provinces] Amorçage des projets impossible : ${describeError(error)}`);
  }
}
