"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import {
  countUnreadGrievancesAction,
  markAllGrievancesReadAction,
  markGrievanceReadAction,
} from "@/actions/admin-grievances";
import { ADMIN } from "@/content/admin";
import { ADMIN_GRIEVANCES } from "@/lib/admin";
import { unreadLabel } from "@/lib/mgp/model";

/**
 * Plaintes non lues : la bulle de la barre latérale, la cloche de la barre du
 * haut, et les deux gestes qui font baisser le compte (ouvrir un dossier, tout
 * marquer comme lu).
 *
 * L'état « lu » est partagé par l'équipe (cf. `Grievance.readAt`).
 */

/** Relecture du compte : une plainte déposée apparaît dans la minute. */
const POLL_MS = 60_000;

/** Événement par lequel un geste de lecture annonce le nouveau compte. */
const UNREAD_EVENT = "ugptn:mgp-unread";

/**
 * Fait baisser la bulle sans attendre la prochaine relecture. Un événement de
 * fenêtre plutôt qu'un contexte : la cloche vit dans la coquille, les gestes
 * dans les pages, et aucun des deux ne doit dépendre de l'autre pour s'afficher.
 */
function announceUnread(count: number) {
  window.dispatchEvent(new CustomEvent<number>(UNREAD_EVENT, { detail: count }));
}

/** « 3 plaintes non lues », « Aucune plainte non lue ». */
export function unreadSummary(count: number): string {
  const t = ADMIN.grievances;
  if (count <= 0) return t.unreadNone;
  return `${count} ${count > 1 ? t.unreadMany : t.unreadOne}`;
}

/**
 * Compte de plaintes non lues, tenu à jour côté client.
 *
 * `initial` vient du serveur (cf. AdminShell) : la bulle s'affiche d'emblée,
 * sans apparaître après hydratation. `null` signifie que le compte n'a pas le
 * module, et rien n'est alors relu.
 *
 * ⚠️ La relecture périodique n'est pas un confort : un layout ne se re-rend pas
 * pendant la navigation (cf. docs Next, `layout.md`). Sans elle, le chiffre
 * calculé au premier chargement resterait figé toute la session.
 */
export function useUnreadGrievances(initial: number | null): number | null {
  const [count, setCount] = useState(initial);

  // Le serveur peut renvoyer une nouvelle valeur (rafraîchissement du routeur
  // après une action) : elle fait foi sur l'état local.
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) {
    setLastInitial(initial);
    setCount(initial);
  }

  const tracked = initial !== null;

  useEffect(() => {
    if (!tracked) return;
    let alive = true;

    // Onglet masqué : personne ne regarde la bulle, inutile d'interroger la base.
    // Le retour sur l'onglet relit aussitôt.
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      countUnreadGrievancesAction().then(
        (value) => { if (alive) setCount(value); },
        // Session expirée, réseau coupé : la dernière valeur reste affichée, la
        // prochaine navigation traitera la session.
        () => {},
      );
    };

    const onAnnounce = (event: Event) => {
      const value = (event as CustomEvent<number>).detail;
      if (typeof value === "number") setCount(value);
    };

    const timer = window.setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener(UNREAD_EVENT, onAnnounce);

    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener(UNREAD_EVENT, onAnnounce);
    };
  }, [tracked]);

  return count;
}

/** Bulle de compte. Muette pour les lecteurs d'écran : le lien qui la porte dit le nombre en toutes lettres. */
export function UnreadBubble({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="adm-bulle" aria-hidden>{unreadLabel(count)}</span>;
}

/** Cloche de la barre du haut. Dessinée ici : c'est de la chrome, pas un module. */
const BellIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="butt"
    strokeLinejoin="miter"
    aria-hidden
    focusable="false"
  >
    <path d="M12 3v2" />
    <path d="M6 17v-6.5L8.5 5h7l2.5 5.5V17" />
    <path d="M4 17h16" />
    <path d="M10 20h4" />
  </svg>
);

/**
 * Accès aux plaintes non lues depuis n'importe quel écran. Elle double la bulle
 * de la barre latérale parce que, sur mobile, cette barre devient un ruban qui
 * défile : l'entrée « Plaintes » peut sortir de l'écran, la barre du haut non.
 */
export function GrievanceBell({ count }: { count: number }) {
  const summary = unreadSummary(count);
  return (
    <Link
      href={count > 0 ? `${ADMIN_GRIEVANCES}?f=non-lues` : ADMIN_GRIEVANCES}
      className="adm-bell"
      aria-label={`${ADMIN.shell.notifications} : ${summary}`}
      title={summary}
    >
      <BellIcon />
      <UnreadBubble count={count} />
    </Link>
  );
}

/**
 * Marque le dossier comme lu à son ouverture. Ne rend rien.
 *
 * Un effet, et non une écriture pendant le rendu serveur : le préchargement
 * d'un lien de la liste ne doit pas faire passer un dossier pour lu.
 */
export function GrievanceReadMarker({ id }: { id: string }) {
  useEffect(() => {
    markGrievanceReadAction(id).then(announceUnread, () => {});
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
    <form action={async (formData) => announceUnread(await markAllGrievancesReadAction(formData))}>
      <input type="hidden" name="before" value={before} />
      <MarkAllButton />
    </form>
  );
}
