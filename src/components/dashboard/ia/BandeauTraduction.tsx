"use client";

/**
 * Ce que le formulaire d'une langue annonce sur son état d'assistance.
 *
 * Il se pose EN TÊTE du formulaire, avant les champs : une personne qui ouvre
 * l'onglet anglais doit savoir avant de lire une ligne que ce qu'elle a sous
 * les yeux a été composé par une machine et n'a jamais été relu.
 *
 * ─── La reprise automatique ──────────────────────────────────────────────────
 *
 * Une tâche laissée `EN_ATTENTE`, ou `EN_COURS` au-delà du délai de garde, est
 * une tâche que le `after()` n'a pas menée à terme — la fonction serverless a
 * été coupée avant la fin (cf. lib/ia/planifier.ts). Personne ne le saura si
 * personne ne la reprend, et le contenu resterait indéfiniment monolingue sans
 * que rien ne le signale.
 *
 * Ce composant la reprend donc, une fois, à l'ouverture de l'écran. Une seule
 * fois par montage : une reprise en boucle sur une tâche qui échoue à chaque
 * essai brûlerait des appels payants sans rien produire. Au deuxième échec,
 * c'est au rédacteur de décider — d'où le bouton, qui reste.
 *
 * ⚠️ Et seulement s'il est À L'ÉCRAN (`actif`). Les onglets de langue masquent
 * sans démonter, et certains écrans rendent plusieurs panneaux dont un seul
 * paraît : un bandeau caché qui se reprendrait tout seul lancerait un appel
 * payant que personne n'a demandé et que personne ne verrait aboutir. Le
 * bandeau reste RENDU quand il est inactif — il doit s'afficher dès que
 * l'onglet s'ouvre, sans attendre un rechargement — il n'AGIT simplement pas.
 */
import { useActionState, useEffect, useRef } from "react";
import {
  relancerTraductionAction,
  validerTraductionAction,
  type TraductionFormState,
} from "@/actions/admin-traduction";
import { STATUT_TITRE, tonDe, type EtatVue } from "@/lib/ia/statut";
import type { Lang } from "@/lib/pick";

const etatInitial: TraductionFormState = { error: null, ok: null };

const LANGUE: Record<Lang, string> = { fr: "français", en: "anglais" };

/** Ce que le bandeau explique, pour chaque état. */
function explication(etat: EtatVue): string {
  const depuis = `depuis le ${LANGUE[etat.sourceLocale]}`;

  switch (etat.statut) {
    case "EN_ATTENTE":
      return `Cette version va être composée ${depuis}. Rechargez dans un instant, ou lancez-la maintenant.`;
    case "EN_COURS":
      return etat.interrompue
        ? `La composition ${depuis} a été interrompue avant sa fin. Reprenez-la, ou saisissez cette langue à la main.`
        : `Composition ${depuis} en cours. Rechargez dans un instant pour voir le résultat.`;
    case "GENEREE":
      return (
        `Ce texte a été composé ${depuis}${etat.modele ? ` par ${etat.modele}` : ""}` +
        `${etat.produiteLe ? `, le ${etat.produiteLe}` : ""}. Il est en ligne, mais personne ne l'a encore relu : ` +
        "corrigez ce qui doit l'être puis enregistrez, ou validez-le tel quel."
      );
    case "ECHEC":
      return etat.erreur ?? "La composition n'a pas abouti.";
    case "RELUE":
      return (
        `Version relue${etat.reluePar ? ` par ${etat.reluePar}` : ""}` +
        `${etat.relueLe ? `, le ${etat.relueLe}` : ""}. L'assistance ne la réécrira plus.`
      );
  }
}

export function BandeauTraduction({
  entite,
  entiteId,
  locale,
  etat,
  sourcePossible,
  actif = true,
}: {
  /** Clé du registre (cf. lib/ia/registre.ts). */
  entite: string;
  entiteId: string;
  /** Langue du formulaire que ce bandeau coiffe. */
  locale: Lang;
  etat: EtatVue | undefined;
  /**
   * Langue qui pourrait alimenter celle-ci, quand elle est encore vide et que
   * l'assistance n'a jamais été sollicitée (cf. `sourcePourTraduire`). C'est ce
   * qui rend traduisible tout le contenu antérieur à la mise en service.
   */
  sourcePossible?: Lang;
  /**
   * Faux quand le bandeau est rendu mais masqué (onglet de langue fermé,
   * panneau replié). Il s'affiche toujours, mais ne reprend rien de lui-même.
   */
  actif?: boolean;
}) {
  const [relance, relancer, relanceEnCours] = useActionState(relancerTraductionAction, etatInitial);
  const [validation, valider, validationEnCours] = useActionState(
    validerTraductionAction,
    etatInitial,
  );

  const repriseFaite = useRef(false);
  const formulaireRelance = useRef<HTMLFormElement>(null);

  const aReprendre =
    actif &&
    etat !== undefined &&
    (etat.statut === "EN_ATTENTE" || (etat.statut === "EN_COURS" && etat.interrompue));

  useEffect(() => {
    if (!aReprendre || repriseFaite.current) return;
    repriseFaite.current = true;
    formulaireRelance.current?.requestSubmit();
  }, [aReprendre]);

  /* Aucun état, mais une langue vide qu'une autre pourrait alimenter : on
     propose, sans rien déclencher. La composition part d'un clic et jamais de
     l'ouverture d'un écran — traduire d'office chaque langue absente de chaque
     fiche consultée coûterait une fortune pour un travail que personne n'a
     demandé. */
  if (!etat) {
    if (!sourcePossible) return null;

    return (
      <div className="adm-ia adm-ia--attente">
        <p className="adm-ia__texte">
          <strong className="adm-ia__titre">Cette version n&apos;existe pas encore</strong>
          L&apos;assistance peut la composer à partir du {LANGUE[sourcePossible]}. Vous obtiendrez
          une première version à relire, pas un texte définitif. Comptez de dix à soixante secondes.
        </p>

        <div className="adm-ia__gestes">
          <form action={relancer}>
            <input type="hidden" name="entite" value={entite} />
            <input type="hidden" name="entiteId" value={entiteId} />
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="btn btn--outline btn--sm" disabled={relanceEnCours}>
              {relanceEnCours
                ? "Traduction en cours…"
                : `Traduire depuis le ${LANGUE[sourcePossible]}`}
            </button>
          </form>

          {relance.error && (
            <span className="adm-hint" role="alert" style={{ color: "var(--red)" }}>
              {relance.error}
            </span>
          )}
        </div>
      </div>
    );
  }

  const ton = tonDe(etat.statut, etat.interrompue);
  const erreur = relance.error ?? validation.error;
  const travailEnCours = relanceEnCours || validationEnCours;

  return (
    <div className={`adm-ia adm-ia--${ton}`} role={ton === "echec" ? "alert" : "status"}>
      <p className="adm-ia__texte">
        <strong className="adm-ia__titre">
          {etat.statut === "EN_COURS" && etat.interrompue
            ? "Traduction interrompue"
            : STATUT_TITRE[etat.statut]}
        </strong>
        {erreur ?? explication(etat)}
      </p>

      <div className="adm-ia__gestes">
        {etat.statut === "GENEREE" && (
          <form action={valider}>
            <input type="hidden" name="entite" value={entite} />
            <input type="hidden" name="entiteId" value={entiteId} />
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="btn btn--outline btn--sm" disabled={travailEnCours}>
              {validationEnCours ? "Validation…" : "Valider sans modifier"}
            </button>
          </form>
        )}

        {etat.statut !== "RELUE" && (
          <form action={relancer} ref={formulaireRelance}>
            <input type="hidden" name="entite" value={entite} />
            <input type="hidden" name="entiteId" value={entiteId} />
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="btn btn--outline btn--sm" disabled={travailEnCours}>
              {relanceEnCours ? "Traduction en cours…" : "Relancer la traduction"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
