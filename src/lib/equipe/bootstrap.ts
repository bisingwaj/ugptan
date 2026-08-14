/**
 * Amorçage des fiches de « L'équipe de l'Unité ».
 *
 * Le site a d'abord vécu avec ces profils écrits en dur dans `content/data.ts`,
 * `content/carbon.ts` et `content/composantes-detail.ts`. Les basculer en base à
 * la première ouverture du module évite deux écueils : quatre pages publiques
 * amputées de leur équipe au lendemain de la mise en service, et une ressaisie
 * manuelle de textes déjà relus et traduits.
 *
 * Même contrat que `lib/impact/bootstrap.ts` : la reprise se fait FICHE PAR
 * FICHE, sur la seule absence de la clé en base, et non sur une table
 * entièrement vide. C'est ce qui permet à un poste ajouté plus tard au contenu
 * d'origine d'être repris à son tour, sans dupliquer ceux qui l'ont déjà été.
 * Une fiche supprimée par un administrateur ne revient donc pas non plus : sa
 * clé est réputée traitée dès lors qu'elle a été créée une fois.
 *
 * Les fiches sont reprises PUBLIÉES, parce qu'elles l'étaient déjà : le module
 * reprend un contenu en ligne, il ne le met pas hors ligne le temps d'une
 * relecture.
 *
 * Ne lève jamais : l'écran du module doit s'afficher même base indisponible.
 */
import { equipeSeedMembres, equipeSeedPoles, type EquipeSeedMembre, type EquipeSeedPole } from "@/content/equipe";
import { db } from "@/lib/db";
import { describeError } from "@/lib/errors";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";

let amorce = false;

/** Traductions d'un pôle, dans les langues servies par le site. */
const traductionsPole = (pole: EquipeSeedPole) =>
  LOCALES.map((locale: Lang) => {
    const textes = locale === "en" ? pole.en : pole.fr;
    return { locale, nom: textes.nom, mission: textes.mission ?? null };
  });

/** Traductions d'une fiche, dans les langues servies par le site. */
const traductionsMembre = (membre: EquipeSeedMembre) =>
  LOCALES.map((locale: Lang) => {
    const textes = locale === "en" ? membre.en : membre.fr;
    return {
      locale,
      nom: textes.nom ?? null,
      role: textes.role,
      mandat: textes.mandat ?? null,
      bio: textes.bio ?? null,
      verbatim: textes.verbatim ?? null,
    };
  });

export async function ensureEquipe(): Promise<void> {
  if (amorce) return;

  try {
    // Les pôles d'abord : une fiche les désigne, ils doivent exister pour être
    // rattachés. L'ordre du contenu d'origine ne le garantit pas, on le force.
    const polesExistants = await db().teamPole.findMany({ select: { id: true, key: true } });
    const parClePole = new Map(polesExistants.map((row) => [row.key, row.id]));

    let polesCrees = 0;
    for (const pole of equipeSeedPoles) {
      if (parClePole.has(pole.key)) continue;

      const cree = await db().teamPole.create({
        data: {
          key: pole.key,
          position: pole.position,
          color: pole.color ?? null,
          translations: { create: traductionsPole(pole) },
        },
        select: { id: true },
      });

      parClePole.set(pole.key, cree.id);
      polesCrees += 1;
    }

    const membresExistants = await db().teamMember.findMany({ select: { key: true } });
    const clesMembres = new Set(membresExistants.map((row) => row.key));

    let membresCrees = 0;
    for (const membre of equipeSeedMembres) {
      if (clesMembres.has(membre.key)) continue;

      await db().teamMember.create({
        data: {
          key: membre.key,
          nom: membre.nom ?? null,
          status: "PUBLISHED",
          position: membre.position,
          featured: membre.featured ?? false,
          color: membre.color ?? null,
          email: membre.email ?? null,
          composante: membre.composante ?? null,
          poleId: parClePole.get(membre.poleKey) ?? null,
          photoPath: membre.photoPath ?? null,
          translations: { create: traductionsMembre(membre) },
        },
        select: { id: true },
      });

      membresCrees += 1;
    }

    amorce = true;
    if (polesCrees > 0 || membresCrees > 0) {
      console.info(
        `[equipe] ${membresCrees} fiche(s) et ${polesCrees} pôle(s) repris depuis le contenu d'origine du site.`,
      );
    }
  } catch (error) {
    console.error(`[equipe] Amorçage impossible : ${describeError(error)}`);
  }
}
