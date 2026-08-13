"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Libellé d'un lien de navigation, qui bascule pendant le chargement.
 *
 * ⚠️ Doit être rendu À L'INTÉRIEUR du `<Link>` : `useLinkStatus` lit l'état du
 * lien ancêtre, et renvoie toujours « au repos » s'il est appelé ailleurs.
 */
function LinkLabel({ children, pendingLabel }: { children: ReactNode; pendingLabel: ReactNode }) {
  const { pending } = useLinkStatus();
  return <>{pending ? pendingLabel : children}</>;
}

/**
 * Lien de navigation qui montre qu'il travaille.
 *
 * Même convention que les boutons de la console : le libellé bascule vers sa
 * forme en cours, suivie de points de suspension. Aucun autre signe, pour que
 * l'attente se lise partout de la même façon.
 *
 * Utile là où la destination est rendue par le serveur après une requête en
 * base — filtres et pagination des listes. Inutile sur un lien vers une page
 * statique déjà préchargée : le libellé n'aurait pas le temps de changer. On ne
 * l'emploie donc pas partout.
 */
export function PendingLink({
  children,
  pendingLabel,
  ...props
}: ComponentProps<typeof Link> & {
  children: ReactNode;
  /** Forme affichée pendant le chargement. Par défaut, le libellé suivi de « … ». */
  pendingLabel?: ReactNode;
}) {
  return (
    <Link {...props}>
      <LinkLabel pendingLabel={pendingLabel ?? <>{children}…</>}>{children}</LinkLabel>
    </Link>
  );
}
