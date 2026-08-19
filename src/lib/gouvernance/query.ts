/**
 * Couche de lecture de « Gouvernance » — l'unique porte d'entrée du site public
 * vers les tables `Organe` et `GouvActivite`.
 *
 * Elle sert deux pages : l'aperçu des trois organes sur l'accueil, et la page
 * « Gouvernance » entière.
 *
 * Trois invariants, repris de `lib/impact/query.ts` et de `lib/projet/query.ts` :
 * rien ne sort qui ne soit publié ; rien ne sort dans la mauvaise langue ; et le
 * dessin des pages ne dépend pas de l'état de la base — tant qu'aucun organe
 * publié n'existe, le contenu d'origine du site prend le relais.
 *
 * ⚠️ La quatrième section de la page publique, « Qui répond de quoi », ne passe
 * PAS par ici : elle affiche les fiches mises en avant du module « L'équipe de
 * l'Unité » (cf. lib/equipe/query.ts). Une personne se saisit à un seul endroit,
 * et ce n'est pas celui-ci.
 */
import { db } from "@/lib/db";
import { lecteur } from "@/lib/lecture";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { gouvActivites as activitesSeed } from "@/content/carbon";
import { organesOrigine } from "@/lib/gouvernance/origine";
import { activiteTraduite, organeTraduit } from "@/lib/gouvernance/statut";

const lecture = lecteur("gouvernance");

/* -------------------------------------------------------------------------- */
/* Vue                                                                         */
/* -------------------------------------------------------------------------- */

/** Un organe résolu dans une langue, prêt à l'affichage. */
export type OrganeVue = {
  id: string;
  sigle: string;
  nom: string;
  nature: string;
  effectif: string;
  /** Attributs de la carte complète. Une ligne vide ne s'affiche pas. */
  presidence: string | null;
  decision: string | null;
  frequence: string | null;
  /** Ce que l'organe fait. `null` : il ne paraît pas dans « Composition ». */
  composition: string | null;
  membres: string[];
};

/** Une décision résolue dans une langue. */
export type ActiviteVue = {
  id: string;
  org: string;
  color: string;
  dateLabel: string;
  titre: string;
  note: string;
};

/* -------------------------------------------------------------------------- */
/* Résolution                                                                  */
/* -------------------------------------------------------------------------- */

const vide = (valeur: string | null | undefined): string | null => {
  const texte = (valeur ?? "").trim();
  return texte.length > 0 ? texte : null;
};

const lignes = (valeurs: readonly string[] | null | undefined): string[] =>
  (valeurs ?? []).map((ligne) => ligne.trim()).filter((ligne) => ligne.length > 0);

/* -------------------------------------------------------------------------- */
/* Lecture                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Organes publiés, résolus dans une langue et dans l'ordre de l'arrêté.
 *
 * Le repli sur le contenu d'origine se décide sur la présence d'un organe
 * publié EN BASE, avant résolution linguistique : sans cela, un organe publié
 * mais non traduit ferait ressurgir le contenu d'origine sur la seule version
 * anglaise, et les deux versions du site ne diraient plus la même chose.
 */
export async function organesPublies(lang: Lang): Promise<OrganeVue[]> {
  const lignesBase = await lecture(
    () => db().organe.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ position: "asc" }, { sigle: "asc" }],
      select: {
        id: true, sigle: true,
        translations: {
          select: {
            locale: true, nom: true, nature: true, effectif: true, presidence: true,
            decision: true, frequence: true, composition: true, membres: true,
          },
        },
      },
    }),
    [],
    "organes de gouvernance",
  );

  if (lignesBase.length === 0) {
    return organesOrigine(lang).map((organe) => ({ id: `seed-${organe.sigle}`, ...organe }));
  }

  return lignesBase
    .map((organe): OrganeVue | null => {
      const tr = organe.translations.find((item) => item.locale === lang);
      if (!tr || !organeTraduit(tr)) return null;
      return {
        id: organe.id,
        sigle: organe.sigle,
        nom: vide(tr.nom) ?? "",
        nature: vide(tr.nature) ?? "",
        effectif: vide(tr.effectif) ?? "",
        presidence: vide(tr.presidence),
        decision: vide(tr.decision),
        frequence: vide(tr.frequence),
        composition: vide(tr.composition),
        membres: lignes(tr.membres),
      };
    })
    .filter((organe): organe is OrganeVue => organe !== null);
}

/** Décisions publiées, résolues dans une langue, de la plus récente à la plus ancienne. */
export async function activitesPubliees(lang: Lang): Promise<ActiviteVue[]> {
  const lignesBase = await lecture(
    () => db().gouvActivite.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      select: {
        id: true, org: true, color: true,
        translations: { select: { locale: true, dateLabel: true, titre: true, note: true } },
      },
    }),
    [],
    "chronique de la gouvernance",
  );

  if (lignesBase.length === 0) {
    return activitesSeed.map((activite, rang) => ({
      id: `seed-act-${rang}`,
      org: activite.org,
      color: activite.color,
      dateLabel: pick(activite.date, lang),
      titre: pick(activite.titre, lang),
      note: pick(activite.note, lang),
    }));
  }

  return lignesBase
    .map((activite): ActiviteVue | null => {
      const tr = activite.translations.find((item) => item.locale === lang);
      if (!tr || !activiteTraduite(tr)) return null;
      return {
        id: activite.id,
        org: activite.org,
        color: activite.color,
        dateLabel: vide(tr.dateLabel) ?? "",
        titre: vide(tr.titre) ?? "",
        note: vide(tr.note) ?? "",
      };
    })
    .filter((activite): activite is ActiviteVue => activite !== null);
}
