"use client";

import { useEffect } from "react";
import { markSubscribersSeenAction } from "@/actions/admin-newsletter";
import { announceNotifications } from "@/components/dashboard/Notifications";

/**
 * Marque comme vues les nouvelles inscriptions à l'ouverture de la page
 * Newsletter. Ne rend rien.
 *
 * Un abonné n'a pas de fiche à ouvrir, comme une plainte : consulter la liste,
 * c'est l'avoir vu. Les lignes « Nouveau » restent affichées le temps de la
 * visite (cf. `markSubscribersSeenAction`), la bulle, elle, s'éteint aussitôt.
 *
 * Un effet, et non une écriture pendant le rendu serveur : le préchargement
 * d'un lien vers la page ne doit rien marquer. `before` borne le marquage aux
 * inscriptions affichées, une adresse arrivée depuis reste signalée.
 */
export function NewsletterSeenMarker({ before }: { before: string }) {
  useEffect(() => {
    markSubscribersSeenAction(before).then(
      (count) => announceNotifications({ newsletter: count }),
      () => {},
    );
  }, [before]);
  return null;
}
