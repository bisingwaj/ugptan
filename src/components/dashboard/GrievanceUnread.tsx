"use client";

import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { markAllGrievancesReadAction, markGrievanceReadAction } from "@/actions/admin-grievances";
import { ADMIN } from "@/content/admin";
import { announceNotifications } from "@/components/dashboard/Notifications";

/**
 * Plaintes non lues : les deux gestes qui font baisser le compte, ouvrir un
 * dossier et tout marquer comme lu. La bulle et la cloche qui l'affichent sont
 * communes à tous les modules (cf. Notifications.tsx).
 *
 * L'état « lu » est partagé par l'équipe (cf. `Grievance.readAt`).
 */

const annoncer = (count: number) => announceNotifications({ mgp: count });

/**
 * Marque le dossier comme lu à son ouverture. Ne rend rien.
 *
 * Un effet, et non une écriture pendant le rendu serveur : le préchargement
 * d'un lien de la liste ne doit pas faire passer un dossier pour lu.
 */
export function GrievanceReadMarker({ id }: { id: string }) {
  useEffect(() => {
    markGrievanceReadAction(id).then(annoncer, () => {});
  }, [id]);
  return null;
}

/** Corps du bouton : `useFormStatus` ne lit que le formulaire ANCESTRAL (cf. LogoutButton). */
function MarkAllButton() {
  const { pending } = useFormStatus();
  const t = ADMIN.grievances;
  return (
    <button type="submit" disabled={pending} className="btn btn--outline btn--sm">
      {pending ? t.markingAllRead : t.markAllRead}
    </button>
  );
}

/**
 * « Tout marquer comme lu ». `before` est l'instant de chargement de la liste :
 * une plainte arrivée depuis n'était pas sous les yeux de l'agent et reste
 * signalée (cf. `markAllGrievancesReadAction`).
 */
export function MarkAllGrievancesRead({ before }: { before: string }) {
  return (
    <form action={async (formData) => annoncer(await markAllGrievancesReadAction(formData))}>
      <input type="hidden" name="before" value={before} />
      <MarkAllButton />
    </form>
  );
}
