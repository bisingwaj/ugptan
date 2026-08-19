/**
 * Amorçage du module « Le projet » — composantes et cadre de résultats.
 *
 * Le site a d'abord vécu avec ces données écrites en dur dans
 * `content/data.ts` et `content/composantes-detail.ts` : cinq composantes,
 * leurs sous-composantes, leur problématique, leurs projets phares, et les
 * onze indicateurs du cadre de résultats. Les basculer en base à la première
 * ouverture du module évite deux écueils : sept pages publiques amputées de
 * leur substance au lendemain de la mise en service, et la ressaisie manuelle
 * de cent trente kilo-octets de textes déjà relus et traduits.
 *
 * Même contrat que `lib/impact/bootstrap.ts` : la reprise se fait LIGNE PAR
 * LIGNE, sur la seule absence de la clé en base. Une composante ajoutée plus
 * tard au contenu d'origine est reprise à son tour sans dupliquer celles qui
 * l'ont déjà été ; une composante supprimée par un administrateur ne revient
 * pas, sa clé étant réputée traitée dès lors qu'elle a été créée une fois.
 *
 * Ne lève jamais : l'écran du module doit s'afficher même base indisponible.
 */
import {
  composantes as composantesSeed, compColors,
  odp as odpSeed, intermediaires as interSeed,
} from "@/content/data";
import { composantesDetail } from "@/content/composantes-detail";
import type { ComposanteDetail } from "@/content/types";
import { db } from "@/lib/db";
import { describeError } from "@/lib/errors";
import { LOCALES } from "@/lib/params";
import type { Bilingual, Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import type { ComposanteBlocType } from "@/lib/projet/statut";

let composantesAmorcees = false;
let indicateursAmorces = false;

/* -------------------------------------------------------------------------- */
/* Blocs                                                                       */
/* -------------------------------------------------------------------------- */

/** Une ligne à créer, avec ses deux langues déjà résolues. */
type BlocAmorce = {
  type: ComposanteBlocType;
  position: number;
  reference?: string | null;
  sigle?: string | null;
  slug?: string | null;
  montant?: number | null;
  cible?: string | null;
  coverKey?: string | null;
  textes: Record<Lang, {
    titre?: string | null;
    texte?: string | null;
    texteSecondaire?: string | null;
    paragraphes?: string[];
    puces?: string[];
  }>;
};

/** Résout un champ bilingue dans les deux langues servies. */
const bilingue = <T,>(fabrique: (lang: Lang) => T): Record<Lang, T> =>
  Object.fromEntries(LOCALES.map((lang) => [lang, fabrique(lang)])) as Record<Lang, T>;

const texteSeul = (valeur: Bilingual): Record<Lang, { texte: string }> =>
  bilingue((lang) => ({ texte: pick(valeur, lang) }));

const titreSeul = (valeur: Bilingual): Record<Lang, { titre: string }> =>
  bilingue((lang) => ({ titre: pick(valeur, lang) }));

/**
 * Toutes les lignes d'une composante, dans l'ordre de sa page.
 *
 * La position est comptée PAR TYPE : c'est ainsi que la console les présente,
 * une liste par section, et que la lecture publique les rassemble.
 */
function blocsAmorce(
  comp: (typeof composantesSeed)[number],
  detail: ComposanteDetail | undefined,
): BlocAmorce[] {
  const blocs: BlocAmorce[] = [];

  // La sous-composante porte son intitulé dans `titre` : c'est lui que la
  // console demande et que l'encart du contexte affiche.
  comp.sous.forEach((sous, position) => {
    blocs.push({
      type: "SOUS_COMPOSANTE",
      position,
      reference: sous.ref,
      montant: sous.montant,
      textes: titreSeul(sous.text) as BlocAmorce["textes"],
    });
  });

  if (!detail) return blocs;

  detail.chapeau.fr.forEach((_, position) => {
    blocs.push({
      type: "CHAPEAU",
      position,
      textes: bilingue((lang) => ({
        texte: (lang === "en" ? detail.chapeau.en : detail.chapeau.fr)[position] ?? "",
      })),
    });
  });

  const pb = detail.problematique;
  if (pb) {
    pb.axes.forEach((axe, position) => {
      blocs.push({
        type: "PB_AXE",
        position,
        textes: bilingue((lang) => ({ titre: pick(axe.t, lang), texte: pick(axe.d, lang) })),
      });
    });
    pb.appui.fr.forEach((_, position) => {
      blocs.push({
        type: "PB_APPUI",
        position,
        textes: bilingue((lang) => ({
          texte: (lang === "en" ? pb.appui.en : pb.appui.fr)[position] ?? "",
        })),
      });
    });
    pb.liens.forEach((lien, position) => {
      blocs.push({
        type: "PB_LIEN",
        position,
        cible: lien.code ?? null,
        textes: texteSeul(lien.t) as BlocAmorce["textes"],
      });
    });
  }

  detail.objectifs.forEach((objectif, position) => {
    blocs.push({ type: "OBJECTIF", position, textes: titreSeul(objectif) as BlocAmorce["textes"] });
  });

  detail.projets.forEach((projet, position) => {
    blocs.push({
      type: "PROJET",
      position,
      reference: projet.n,
      sigle: projet.sigle ?? null,
      slug: projet.slug,
      coverKey: projet.img ?? null,
      textes: bilingue((lang) => ({
        titre: pick(projet.titre, lang),
        texteSecondaire: projet.statut ? pick(projet.statut, lang) : null,
        paragraphes: lang === "en" ? projet.corps.en : projet.corps.fr,
        puces: (projet.points ?? []).map((point) => pick(point, lang)),
        texte: projet.chute ? pick(projet.chute, lang) : null,
      })),
    });
  });

  detail.ecosysteme?.couches.forEach((couche, position) => {
    blocs.push({
      type: "ECO_COUCHE",
      position,
      textes: bilingue((lang) => ({ titre: pick(couche.t, lang), texte: pick(couche.d, lang) })),
    });
  });

  detail.finalite?.points.forEach((point, position) => {
    blocs.push({ type: "FIN_POINT", position, textes: titreSeul(point) as BlocAmorce["textes"] });
  });

  return blocs;
}

/**
 * Colonnes d'un bloc, sans ses traductions.
 *
 * ⚠️ Les traductions sont créées SÉPARÉMENT, et ce n'est pas un détail de
 * style. Écrites en `create` imbriqué, elles partent une par une : la reprise
 * du contenu d'origine compte plus de quatre cents lignes, et chaque
 * aller-retour vers Neon coûte une demi-seconde. La première ouverture de
 * l'écran a mis QUATRE MINUTES avant que ce chemin soit groupé — bien au-delà
 * du délai d'une fonction serveur, donc un écran qui n'aurait jamais fini de
 * charger en production. Groupées, les mêmes lignes partent en deux envois.
 */
const colonnesBloc = (composanteId: string, bloc: BlocAmorce) => ({
  composanteId,
  type: bloc.type,
  position: bloc.position,
  status: "PUBLISHED" as const,
  reference: bloc.reference ?? null,
  sigle: bloc.sigle ?? null,
  slug: bloc.slug ?? null,
  montant: bloc.montant ?? null,
  cible: bloc.cible ?? null,
  coverKey: bloc.coverKey ?? null,
});

/** Traductions d'un bloc déjà créé, dans les deux langues servies. */
const traductionsBloc = (blocId: string, bloc: BlocAmorce) =>
  LOCALES.map((locale: Lang) => {
    const textes = bloc.textes[locale];
    return {
      blocId,
      locale,
      titre: textes.titre ?? null,
      texte: textes.texte ?? null,
      texteSecondaire: textes.texteSecondaire ?? null,
      paragraphes: textes.paragraphes ?? [],
      puces: textes.puces ?? [],
    };
  });

/* -------------------------------------------------------------------------- */
/* Composantes                                                                 */
/* -------------------------------------------------------------------------- */

export async function ensureComposantes(): Promise<void> {
  if (composantesAmorcees) return;

  try {
    const existantes = await db().composante.findMany({ select: { key: true } });
    const prises = new Set(existantes.map((row) => row.key));

    /* La fiche d'abord, ses entrées ensuite, et les deux en LOT. Le détail des
       cinq composantes pèse plus de quatre cents lignes : les écrire une par
       une tenait l'écran quatre minutes (cf. `colonnesBloc`). */
    const nouvelles: { id: string; blocs: BlocAmorce[] }[] = [];

    for (const [position, comp] of composantesSeed.entries()) {
      const key = comp.code;
      if (prises.has(key)) continue;

      const detail = composantesDetail.find((item) => item.code === comp.code);

      const creee = await db().composante.create({
        data: {
          key,
          code: comp.code,
          slug: detail?.slug ?? comp.code.toLowerCase(),
          color: compColors[comp.code] ?? "#6f6f6f",
          status: "PUBLISHED",
          position,
          montant: comp.montant,
          ida: comp.ida,
          afd: comp.afd,
          odpCodes: detail?.odp ?? [],
          coverKey: detail?.img ?? null,
          videoYt: detail?.video?.yt ?? null,
          videoSrc: detail?.video?.src ?? null,
          videoDuree: detail?.video?.duree ?? null,
          videoPosterKey: detail?.video?.poster ?? null,
          translations: {
            create: LOCALES.map((locale: Lang) => ({
              locale,
              titre: pick(comp.titre, locale),
              desc: pick(comp.desc, locale),
              titreLong: detail ? pick(detail.titreLong, locale) : null,
              soustitre: detail ? pick(detail.soustitre, locale) : null,
              pbTitre: detail?.problematique ? pick(detail.problematique.titre, locale) : null,
              pbLead: detail?.problematique ? pick(detail.problematique.lead, locale) : null,
              ecoTitre: detail?.ecosysteme ? pick(detail.ecosysteme.titre, locale) : null,
              ecoLead: detail?.ecosysteme ? pick(detail.ecosysteme.lead, locale) : null,
              finTitre: detail?.finalite ? pick(detail.finalite.titre, locale) : null,
              finLead: detail?.finalite ? pick(detail.finalite.lead, locale) : null,
              videoTitre: detail?.video ? pick(detail.video.titre, locale) : null,
            })),
          },
        },
        select: { id: true },
      });

      prises.add(key);
      nouvelles.push({ id: creee.id, blocs: blocsAmorce(comp, detail) });
    }

    /* Toutes les entrées des cinq composantes en un envoi, puis toutes leurs
       traductions en un second.

       ⚠️ `createManyAndReturn` rend les lignes DANS L'ORDRE des données
       fournies — un seul `INSERT … RETURNING`, dont PostgreSQL restitue les
       lignes dans l'ordre d'insertion. C'est ce qui permet d'apparier chaque
       identifiant rendu à l'entrée qui l'a produit sans clé de corrélation. */
    const plan = nouvelles.flatMap(({ id, blocs }) => blocs.map((bloc) => ({ id, bloc })));

    if (plan.length > 0) {
      const lignes = await db().composanteBloc.createManyAndReturn({
        data: plan.map(({ id, bloc }) => colonnesBloc(id, bloc)),
        select: { id: true },
      });

      await db().composanteBlocTranslation.createMany({
        data: lignes.flatMap((ligne, rang) => traductionsBloc(ligne.id, plan[rang].bloc)),
      });
    }

    composantesAmorcees = true;
    if (nouvelles.length > 0) {
      console.info(
        `[projet] ${nouvelles.length} composante(s) et ${plan.length} entrée(s) reprises depuis le contenu d'origine du site.`,
      );
    }
  } catch (error) {
    console.error(`[projet] Amorçage des composantes impossible : ${describeError(error)}`);
  }
}

/* -------------------------------------------------------------------------- */
/* Cadre de résultats                                                          */
/* -------------------------------------------------------------------------- */

export async function ensureIndicateurs(): Promise<void> {
  if (indicateursAmorces) return;

  try {
    const existants = await db().indicateur.findMany({ select: { key: true } });
    const prises = new Set(existants.map((row) => row.key));

    /* ⚠️ `baseline` et `femmes` étaient rédigés en français SEUL et s'affichaient
       tels quels sur la version anglaise. La reprise les recopie à l'identique
       dans les deux langues : inventer une traduction ici mettrait en ligne un
       texte que personne n'a relu. La console permet de la fournir. */
    const lignes = [
      ...odpSeed.map((item, position) => ({
        key: item.code,
        famille: "ODP" as const,
        code: item.code,
        position,
        valeur: String(item.value),
        valeurNum: item.value,
        traduction: (locale: Lang) => ({
          label: pick(item.label, locale),
          baseline: item.baseline,
          note: item.femmes,
          unit: pick(item.unit, locale) || null,
        }),
      })),
      ...interSeed.map((item, position) => ({
        key: `INTER-${position + 1}`,
        famille: "INTERMEDIAIRE" as const,
        code: null,
        position,
        valeur: item.value,
        valeurNum: null,
        traduction: (locale: Lang) => ({
          label: pick(item.text, locale),
          baseline: null,
          note: null,
          unit: pick(item.unit, locale) || null,
        }),
      })),
    ];

    // Groupé pour la même raison que les entrées d'une composante : onze
    // indicateurs et leurs vingt-deux traductions font trente-trois
    // allers-retours écrits ligne à ligne, deux écrits en lot.
    const aCreer = lignes.filter((ligne) => !prises.has(ligne.key));

    if (aCreer.length > 0) {
      const crees = await db().indicateur.createManyAndReturn({
        data: aCreer.map((ligne) => ({
          key: ligne.key,
          famille: ligne.famille,
          code: ligne.code,
          status: "PUBLISHED" as const,
          position: ligne.position,
          valeur: ligne.valeur,
          valeurNum: ligne.valeurNum,
        })),
        select: { id: true },
      });

      // Même appariement par le rang que pour les entrées (cf. plus haut).
      await db().indicateurTranslation.createMany({
        data: crees.flatMap((ligne, rang) =>
          LOCALES.map((locale: Lang) => ({
            indicateurId: ligne.id,
            locale,
            ...aCreer[rang].traduction(locale),
          })),
        ),
      });
    }

    indicateursAmorces = true;
    if (aCreer.length > 0) {
      console.info(`[projet] ${aCreer.length} indicateur(s) repris depuis le contenu d'origine du site.`);
    }
  } catch (error) {
    console.error(`[projet] Amorçage des indicateurs impossible : ${describeError(error)}`);
  }
}
