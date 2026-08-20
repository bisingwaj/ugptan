import "server-only";

/**
 * Composer une langue à partir d'une autre.
 *
 * Ce module fait UN aller-retour avec le modèle et écrit le résultat. Il ne
 * décide pas s'il faut traduire — c'est `suivi.ts` qui tient cette règle — et
 * il ne planifie rien : `planifier.ts` s'en charge.
 *
 * Trois garde-fous encadrent ce qui revient du modèle :
 *
 *   1. Le HTML est RÉASSAINI avant écriture, exactement comme celui que tape un
 *      rédacteur. Un modèle est une source non fiable au même titre qu'un
 *      navigateur : rien de ce qu'il rend n'entre en base sans passer par
 *      `sanitizeHtml`.
 *   2. Le slug n'est jamais demandé au modèle. Il est dérivé du titre traduit
 *      puis rendu unique dans sa langue — l'unicité est une contrainte de base,
 *      pas une question de rédaction.
 *   3. Un champ vide à la source reste vide à l'arrivée. Le modèle ne comble
 *      jamais un trou, et la langue produite est le reflet exact de la source.
 */
import type { Lang } from "@/lib/pick";
import { isEmptyHtml, sanitizeHtml } from "@/lib/html/sanitize";
import { slugify } from "@/lib/actus/slug";
import { ErreurModele, generer, lireObjet } from "@/lib/ia/client";
import { SOCLE, composerMessage } from "@/lib/ia/invite";
import type { Champ, Entite, LigneTraduction } from "@/lib/ia/registre";

/**
 * Au-delà, un seul appel ne suffit plus : la réponse serait coupée au plafond
 * de jetons et rendue inutilisable. Mieux vaut le dire franchement que de
 * livrer une traduction tronquée dont personne ne verrait qu'il lui manque la
 * fin.
 */
const LIMITE_CARACTERES = 45_000;

export type Resultat =
  | { etat: "ecrite"; champs: string[]; modele: string }
  /** La source est vide ou absente : il n'y a rien à traduire, et ce n'est pas un échec. */
  | { etat: "rien" };

/* -------------------------------------------------------------------------- */
/* Lecture de la source                                                        */
/* -------------------------------------------------------------------------- */

/** Valeur d'un champ, ramenée à ce que sa nature autorise. */
function valeurSource(champ: Champ, brut: unknown): string | string[] | null {
  if (champ.nature === "liste") {
    if (!Array.isArray(brut)) return null;
    const entrees = brut.map((e) => String(e ?? "").trim()).filter(Boolean);
    return entrees.length ? entrees : null;
  }
  const texte = typeof brut === "string" ? brut.trim() : "";
  if (!texte) return null;
  if (champ.nature === "html" && isEmptyHtml(texte)) return null;
  return texte;
}

/* -------------------------------------------------------------------------- */
/* Relecture de ce que rend le modèle                                          */
/* -------------------------------------------------------------------------- */

/**
 * Ramène une valeur rendue par le modèle à la forme qu'attend la colonne.
 *
 * `null` signifie « le modèle n'a rien rendu d'exploitable pour ce champ » —
 * l'appelant décide alors si c'est rédhibitoire (champ obligatoire) ou non.
 */
function valeurRendue(champ: Champ, brut: unknown): string | string[] | null {
  if (champ.nature === "liste") {
    // Tolérance utile : certains modèles rendent une liste comme un bloc de
    // lignes plutôt que comme un tableau. La forme diffère, le contenu est bon.
    const entrees = Array.isArray(brut)
      ? brut.map((e) => String(e ?? "").trim())
      : typeof brut === "string"
        ? brut.split("\n").map((ligne) => ligne.replace(/^[-•*]\s*/, "").trim())
        : [];
    const retenues = entrees.filter(Boolean);
    return retenues.length ? retenues : null;
  }

  if (typeof brut !== "string") return null;
  const texte = brut.trim();
  if (!texte) return null;

  if (champ.nature === "html") {
    // Même barrière que pour la saisie humaine : ce qui descend plus bas est
    // réputé sûr (cf. src/lib/html/sanitize.ts).
    const propre = sanitizeHtml(texte);
    return isEmptyHtml(propre) ? null : propre;
  }

  // Une ligne reste une ligne : un modèle glisse parfois un retour chariot dans
  // un titre, ce qui casserait l'affichage des cartes.
  return champ.nature === "texte" ? texte.replace(/\s*\n+\s*/g, " ") : texte;
}

/* -------------------------------------------------------------------------- */
/* Traduction                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Compose la version `vers` d'une entité à partir de sa version `de`, et
 * l'écrit.
 *
 * Lève une `ErreurModele` portant un message déjà rédigé pour la console si le
 * modèle est injoignable, muet, ou s'il rend un texte inexploitable.
 */
export async function traduireEntite(
  entite: Entite,
  entiteId: string,
  de: Lang,
  vers: Lang,
): Promise<Resultat> {
  const source = (await entite.lire(entiteId, de)) as LigneTraduction | null;
  if (!source) return { etat: "rien" };

  const aEnvoyer = entite.champs
    .map((champ) => ({ champ, valeur: valeurSource(champ, source[champ.nom]) }))
    .filter((ligne): ligne is { champ: Champ; valeur: string | string[] } => ligne.valeur !== null);

  if (aEnvoyer.length === 0) return { etat: "rien" };

  const poids = aEnvoyer.reduce(
    (total, { valeur }) => total + (Array.isArray(valeur) ? valeur.join("").length : valeur.length),
    0,
  );
  if (poids > LIMITE_CARACTERES) {
    throw new ErreurModele(
      `Ce contenu dépasse ce qu'une seule génération peut rendre (${Math.round(poids / 1000)} 000 caractères). ` +
        "Traduisez cette langue à la main, ou scindez le contenu.",
    );
  }

  const generation = await generer({
    systeme: SOCLE,
    message: composerMessage(entite, de, vers, aEnvoyer),
    json: true,
    // Le rendu pèse à peu près autant que la source, plus l'enveloppe JSON.
    maxTokens: Math.min(16_000, Math.ceil(poids / 3) + 1_500),
    timeoutMs: poids > 12_000 ? 150_000 : 90_000,
  });

  const rendu = lireObjet(generation);

  /* Écriture : le champ traduit s'il a été envoyé, le VIDE sinon. Une langue
     produite est le reflet exact de la source ; laisser subsister l'ancienne
     valeur d'un champ vidé entre-temps ferait paraître en anglais une phrase
     que le français ne dit plus. */
  const valeurs: Record<string, unknown> = {};
  const ecrits: string[] = [];

  for (const champ of entite.champs) {
    const envoye = aEnvoyer.find((ligne) => ligne.champ.nom === champ.nom);
    if (!envoye) {
      valeurs[champ.nom] = champ.nature === "liste" ? [] : null;
      continue;
    }

    const valeur = valeurRendue(champ, rendu[champ.nom]);
    if (valeur === null) {
      if (entite.obligatoires.includes(champ.nom)) {
        throw new ErreurModele(
          `Le modèle n'a rien rendu pour « ${champ.nom} », qui est obligatoire. Relancez, ou saisissez cette langue à la main.`,
        );
      }
      // Champ facultatif manquant : on retombe sur le vide plutôt que de
      // recopier la source, qui laisserait du français sur une page anglaise.
      valeurs[champ.nom] = champ.nature === "liste" ? [] : null;
      continue;
    }

    valeurs[champ.nom] = valeur;
    ecrits.push(champ.nom);
  }

  if (ecrits.length === 0) {
    throw new ErreurModele("Le modèle n'a rendu aucun champ exploitable. Relancez la traduction.");
  }

  if (entite.slugDepuis && entite.slugUnique) {
    const titre = valeurs[entite.slugDepuis];
    const base = slugify(typeof titre === "string" ? titre : "");
    valeurs.slug = await entite.slugUnique(entiteId, vers, base);
  }

  await entite.ecrire(entiteId, vers, valeurs);
  entite.revalider();

  return { etat: "ecrite", champs: ecrits, modele: generation.modele };
}
