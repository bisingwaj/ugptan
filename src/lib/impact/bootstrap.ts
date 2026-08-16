/**
 * Amorçage des sections « Histoires & impact ».
 *
 * Le site a d'abord vécu avec ces blocs écrits en dur dans `content/carbon.ts`
 * et `content/data.ts`. Les basculer en base à la première ouverture du module
 * évite deux écueils : trois pages publiques amputées de leurs blocs au
 * lendemain de la mise en service, et une ressaisie manuelle de textes déjà
 * relus et traduits.
 *
 * Même contrat que `lib/events/bootstrap.ts`, avec une nuance : la reprise se
 * fait SECTION PAR SECTION, sur la seule absence de la clé en base, et non sur
 * une table entièrement vide. C'est ce qui permet à un emplacement ajouté plus
 * tard au contenu d'origine d'être repris à son tour, sans dupliquer ceux qui
 * l'ont déjà été. Une section supprimée par un administrateur ne revient donc
 * pas non plus : sa clé est réputée traitée dès lors qu'elle a été créée une
 * fois — c'est le rôle du garde `ImpactAmorcage` ci-dessous.
 *
 * Ne lève jamais : l'écran du module doit s'afficher même base indisponible.
 */
import { impactSeed, type ImpactSeedSection } from "@/content/impact";
import { db } from "@/lib/db";
import { describeError } from "@/lib/errors";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";

let amorce = false;

/** Traductions d'une section, dans les langues servies par le site. */
const traductionsSection = (section: ImpactSeedSection) =>
  LOCALES.map((locale: Lang) => {
    const entete = locale === "en" ? section.en : section.fr;
    return {
      locale,
      kicker: entete.kicker ?? null,
      titre: entete.titre ?? null,
      lead: entete.lead ?? null,
      ctaLabel: entete.ctaLabel ?? null,
      note: entete.note ?? null,
    };
  });

/** Entrées d'une section, chacune avec ses deux langues. */
const itemsSection = (section: ImpactSeedSection) =>
  section.items.map((item, index) => ({
    position: index,
    status: "PUBLISHED" as const,
    valeur: item.valeur ?? null,
    color: item.color ?? null,
    videoYt: item.videoYt ?? null,
    lienUrl: item.lienUrl ?? null,
    dateAt: item.dateISO ? new Date(`${item.dateISO}T09:00:00+01:00`) : null,
    coverKey: item.coverKey ?? null,
    tags: item.tags ?? [],
    translations: {
      create: LOCALES.map((locale: Lang) => {
        const textes = locale === "en" ? item.en : item.fr;
        return {
          locale,
          surtitre: textes.surtitre ?? null,
          titre: textes.titre ?? null,
          texte: textes.texte ?? null,
          texteSecondaire: textes.texteSecondaire ?? null,
          lienLabel: textes.lienLabel ?? null,
          mediaAlt: textes.mediaAlt ?? null,
        };
      }),
    },
  }));

export async function ensureImpact(): Promise<void> {
  if (amorce) return;

  try {
    const existantes = await db().impactSection.findMany({ select: { id: true, key: true } });
    const parCle = new Map(existantes.map((row) => [row.key, row.id]));

    // Les sources d'abord : une section qui reprend les entrées d'une autre a
    // besoin que celle-ci existe pour la désigner. L'ordre du contenu
    // d'origine ne le garantit pas, on le force ici.
    const ordonnees = [...impactSeed].sort((a, b) => Number(Boolean(a.sourceKey)) - Number(Boolean(b.sourceKey)));

    let creees = 0;
    for (const section of ordonnees) {
      if (parCle.has(section.key)) continue;

      const creee = await db().impactSection.create({
        data: {
          key: section.key,
          emplacement: section.emplacement,
          layout: section.layout,
          theme: section.theme,
          status: "PUBLISHED",
          position: section.position,
          numero: section.numero ?? null,
          compact: section.compact ?? false,
          grandTitre: section.grandTitre ?? false,
          enchaine: section.enchaine ?? false,
          ctaUrl: section.ctaUrl ?? null,
          limite: section.limite ?? null,
          sourceId: section.sourceKey ? parCle.get(section.sourceKey) ?? null : null,
          translations: { create: traductionsSection(section) },
          items: { create: itemsSection(section) },
        },
        select: { id: true },
      });

      parCle.set(section.key, creee.id);
      creees += 1;
    }

    amorce = true;
    if (creees > 0) {
      console.info(`[impact] ${creees} section(s) reprises depuis le contenu d'origine du site.`);
    }
  } catch (error) {
    console.error(`[impact] Amorçage impossible : ${describeError(error)}`);
  }
}
