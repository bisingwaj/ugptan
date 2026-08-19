"use client";

/**
 * Bouton qui rend visible ce qu'il déclenche.
 *
 * ─── Ce qu'il résout ────────────────────────────────────────────────────────
 *
 * Les trois formulaires publics (lettre d'information, plainte, inscription à
 * un événement) faisaient la même chose : désactiver le bouton et changer son
 * libellé. Entre le clic et la réponse, l'écran ne bougeait plus. Sur une
 * connexion lente, deux secondes d'immobilité se lisent comme une panne, et le
 * geste suivant est un second clic.
 *
 * Ce composant ajoute la seule chose qui manquait : une progression. Elle avance
 * jusqu'à 88 % pendant l'attente, puis franchit les derniers pour cent à la
 * réponse (cf. styles/interactions.css, qui explique pourquoi elle s'arrête
 * avant la fin plutôt que de tourner en rond).
 *
 * ─── Ce qu'il ne fait pas ───────────────────────────────────────────────────
 *
 * Il n'annonce pas le succès avant de l'avoir. Une inscription peut être
 * refusée — adresse invalide, limite de débit, adresse désabonnée qui exige une
 * confirmation — et un écran de réussite qu'il faudrait retirer ensuite abîme
 * plus la confiance que deux secondes d'attente honnête. L'anticipation porte
 * sur le MOUVEMENT, jamais sur le RÉSULTAT.
 */
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Durée d'affichage de la barre pleine avant retour au repos. */
const TEMPS_FIN = 420;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Vrai tant que l'action serveur n'a pas répondu. */
  pending: boolean;
  /** Libellé de repos. */
  children: ReactNode;
  /** Libellé pendant l'attente. Sans lui, le libellé de repos est conservé. */
  labelPending?: ReactNode;
};

export function BoutonAction({ pending, children, labelPending, className, disabled, ...rest }: Props) {
  /* `repos` → `attente` → `fini` → `repos`. L'état `fini` n'existe que le temps
     de l'animation de fermeture : c'est lui qui fait franchir les derniers
     pour cent au lieu de faire disparaître la barre d'un coup. */
  const [etat, setEtat] = useState<"repos" | "attente" | "fini">("repos");
  const etaitEnAttente = useRef(false);

  useEffect(() => {
    if (pending) {
      etaitEnAttente.current = true;
      setEtat("attente");
      return;
    }
    // Sans ce garde, le montage initial (pending déjà faux) jouerait
    // l'animation de fin alors que rien n'a été demandé.
    if (!etaitEnAttente.current) return;

    etaitEnAttente.current = false;
    setEtat("fini");
    const minuteur = setTimeout(() => setEtat("repos"), TEMPS_FIN);
    return () => clearTimeout(minuteur);
  }, [pending]);

  return (
    <button
      {...rest}
      data-etat={etat}
      disabled={disabled ?? pending}
      /* `aria-busy` porte l'information pour les lecteurs d'écran : la barre est
         purement visuelle, et le libellé seul ne dit pas qu'une opération court. */
      aria-busy={pending || undefined}
      className={cn("btn btn--action", className)}
    >
      <span>{pending && labelPending ? labelPending : children}</span>
    </button>
  );
}
