/**
 * Lecture de l'état de fermeture depuis le PROXY.
 *
 * ⚠️ Module lu par `src/proxy.ts`, donc exécuté sur le moteur périphérique :
 * aucun import de Prisma, de `node:crypto` ni de `next/headers`. Il ne fait
 * qu'appeler la route interne `/api/site/etat`, qui, elle, a le droit de lire
 * la base.
 *
 * MÉMO DE QUINZE SECONDES. Sans lui, chaque page vue paierait un aller-retour
 * interne. Avec lui, une fermeture met au pire quinze secondes à se propager
 * sur une instance déjà chaude, ce qui est sans commune mesure avec les deux
 * minutes de revalidation qu'on remplace, et invisible à l'échelle d'une
 * intervention technique.
 *
 * EN CAS DE PANNE, LE SITE RESTE OUVERT, et l'échec n'est pas mémorisé : la
 * requête suivante retente. Une route interne momentanément muette ne doit pas
 * fermer un site que personne n'a décidé de fermer, ni le garder fermé une fois
 * la décision levée.
 */

export type EtatProxy = {
  ferme: boolean;
  /** Valeur exacte que le cookie de laissez-passer doit présenter. */
  empreinte: string | null;
};

const OUVERT: EtatProxy = { ferme: false, empreinte: null };

const PEREMPTION_MS = 15_000;

let memo: { valeur: EtatProxy; expire: number } | null = null;

export async function etatPourProxy(origine: string): Promise<EtatProxy> {
  const maintenant = Date.now();
  if (memo && memo.expire > maintenant) return memo.valeur;

  const clef = process.env.BETTER_AUTH_SECRET;
  // Sans clef partagée, la route interne se tait : inutile de l'appeler.
  if (!clef) return OUVERT;

  try {
    const reponse = await fetch(new URL("/api/site/etat", origine), {
      headers: { "x-ugptn-etat": clef },
      cache: "no-store",
    });
    if (!reponse.ok) return OUVERT;

    const valeur = (await reponse.json()) as EtatProxy;
    memo = { valeur, expire: maintenant + PEREMPTION_MS };
    return valeur;
  } catch {
    return OUVERT;
  }
}
