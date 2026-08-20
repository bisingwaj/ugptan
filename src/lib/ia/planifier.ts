import "server-only";

/**
 * Le déclenchement.
 *
 * Enregistrer une langue lance la composition des autres. Le geste est le même
 * qu'avant pour le rédacteur : il écrit son français, il enregistre, la page se
 * recharge — et l'onglet anglais annonce déjà qu'une traduction est en route.
 *
 * ─── Pourquoi deux temps ─────────────────────────────────────────────────────
 *
 * La DEMANDE est inscrite pendant l'action, avant la réponse : c'est ce qui
 * permet à l'écran rechargé d'afficher « en attente » plutôt que rien. Le
 * TRAVAIL, lui, part dans un `after()` : il dure de dix à soixante secondes,
 * et faire patienter le rédacteur pendant ce temps rendrait l'enregistrement
 * insupportable.
 *
 * ─── Ce qu'il faut savoir du `after()` ───────────────────────────────────────
 *
 * Il s'exécute après la réponse HTTP, dans la même fonction serverless. Rien ne
 * garantit qu'il aille au bout : la plateforme peut couper la fonction à son
 * plafond de durée, et elle ne prévient pas. C'est précisément pourquoi l'état
 * vit en base et non en mémoire — une tâche coupée reste `EN_COURS`, le délai
 * de garde la déclare interrompue (cf. suivi.ts), et `relancerTraduction`
 * la reprend. Le `after()` est le chemin heureux, pas la garantie.
 *
 * Aucune erreur ne remonte d'ici. Une traduction qui échoue est une traduction
 * qui manque, pas un enregistrement perdu : le contenu du rédacteur est déjà
 * en base quand ce module entre en jeu.
 */
import { after } from "next/server";
import type { Lang } from "@/lib/pick";
import { ErreurModele, iaConfiguree } from "@/lib/ia/client";
import { entite as trouverEntite } from "@/lib/ia/registre";
import { traduireEntite } from "@/lib/ia/traduction";
import {
  aTraduire,
  ciblesDepuis,
  commencer,
  demander,
  echouer,
  marquerRelue,
  reussir,
} from "@/lib/ia/suivi";

/**
 * Compose une langue, de bout en bout, en tenant le journal à jour.
 *
 * Ne lève jamais : le motif d'échec est écrit dans le journal, où la console
 * ira le lire. C'est le seul endroit qui écrit `GENEREE` ou `ECHEC`.
 */
export async function executerTraduction(
  entiteCle: string,
  entiteId: string,
  source: Lang,
  cible: Lang,
): Promise<void> {
  const cible_ = trouverEntite(entiteCle);
  if (!cible_) return;

  try {
    // L'entité a pu être supprimée entre la demande et son exécution : le
    // `after()` tourne après la réponse, et rien n'interdit une suppression
    // dans l'intervalle.
    if (!(await cible_.existe(entiteId))) return;

    /* Relevé AVANT l'appel, et conservé même en cas d'échec : c'est le seul
       moyen de nommer le contenu dans l'écran de suivi sans y relire onze
       tables. Une lecture de plus, négligeable devant un appel de modèle. */
    const ligneSource = await cible_.lire(entiteId, source);
    const intitule = ligneSource ? cible_.intitule(ligneSource) : null;

    await commencer(entiteCle, entiteId, cible);
    const resultat = await traduireEntite(cible_, entiteId, source, cible);

    if (resultat.etat === "rien") {
      await echouer(
        entiteCle,
        entiteId,
        cible,
        "La langue source ne porte aucun texte à traduire.",
        intitule,
      );
      return;
    }

    await reussir(entiteCle, entiteId, cible, {
      modele: resultat.modele,
      champs: resultat.champs,
      intitule,
    });
  } catch (erreur) {
    const motif =
      erreur instanceof ErreurModele
        ? erreur.message
        : "La traduction a échoué pour une raison inattendue. Relancez, ou saisissez cette langue à la main.";
    if (!(erreur instanceof ErreurModele)) {
      console.error(`Traduction ${entiteCle}/${entiteId} → ${cible} :`, erreur);
    }
    await echouer(entiteCle, entiteId, cible, motif).catch(() => {});
  }
}

/**
 * Point d'entrée des actions d'enregistrement.
 *
 * À appeler juste après l'écriture d'une langue, avec la langue qui vient
 * d'être écrite. Les langues qui appartiennent déjà à quelqu'un sont écartées
 * ici (cf. `aTraduire`) : cette fonction ne peut pas écraser un texte humain.
 *
 * Silencieuse et sans effet si l'assistance n'est pas configurée — le CMS
 * reste entièrement utilisable sans clé OpenRouter.
 */
export async function planifierTraduction(
  entiteCle: string,
  entiteId: string,
  source: Lang,
): Promise<void> {
  if (!iaConfiguree()) return;

  const entite = trouverEntite(entiteCle);
  if (!entite) return;

  try {
    const cibles: Lang[] = [];
    for (const cible of ciblesDepuis(source)) {
      if (await aTraduire(entite, entiteId, cible)) {
        await demander(entiteCle, entiteId, source, cible);
        cibles.push(cible);
      }
    }
    if (cibles.length === 0) return;

    after(async () => {
      // En série, et non en parallèle : deux appels simultanés au même
      // fournisseur depuis une fonction déjà en sursis n'accélèrent rien et
      // doublent le risque de limitation de débit.
      for (const cible of cibles) {
        await executerTraduction(entiteCle, entiteId, source, cible);
      }
    });
  } catch (erreur) {
    // Une planification qui échoue ne doit surtout pas faire échouer
    // l'enregistrement : le contenu est déjà écrit.
    console.error(`Planification de traduction ${entiteCle}/${entiteId} :`, erreur);
  }
}

/**
 * Ce que fait une action d'enregistrement de langue, après son écriture.
 *
 * Deux gestes, indissociables, et dans cet ordre :
 *
 *   1. la langue qui vient d'être enregistrée est RELUE — quelqu'un l'a ouverte
 *      et validée, elle cesse d'appartenir à l'assistance ;
 *   2. les autres langues sont demandées, si elles sont encore libres.
 *
 * L'ordre importe : marquer d'abord évite qu'un enregistrement de l'anglais
 * déclenche une régénération de ce même anglais au motif qu'il portait encore
 * la mention « générée ».
 *
 * ⚠️ Ne lève jamais. L'assistance est un service rendu au rédacteur, pas une
 * condition de son enregistrement : une panne du fournisseur ne doit pas
 * transformer une sauvegarde réussie en message d'erreur.
 */
export async function apresEnregistrementLangue(
  entiteCle: string,
  entiteId: string,
  locale: Lang,
  acteurId: string | null,
): Promise<void> {
  try {
    await marquerRelue(entiteCle, entiteId, locale, acteurId);
    await planifierTraduction(entiteCle, entiteId, locale);
  } catch (erreur) {
    console.error(`Suivi de traduction ${entiteCle}/${entiteId} (${locale}) :`, erreur);
  }
}
