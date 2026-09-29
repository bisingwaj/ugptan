"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { compterNotificationsAction } from "@/actions/admin-notifications";
import { ADMIN } from "@/content/admin";
import { unreadLabel } from "@/lib/mgp/model";
import {
  NOTIFICATION_KEYS,
  estSuivi,
  lienNotification,
  resumeNotification,
  totalNotifications,
  type Notifications,
} from "@/lib/notifications-model";

/**
 * Bulles de notification de la console : leurs comptes, tenus à jour côté
 * client, et la cloche de la barre du haut qui les réunit.
 *
 * Les modules suivis sont déclarés dans lib/notifications-model.ts. Chacun
 * fournit ensuite, dans ses propres pages, le geste qui fait baisser son compte
 * (ouvrir une plainte, consulter la liste des abonnés) et l'annonce par
 * `announceNotifications`.
 *
 * L'état « lu » est partagé par l'équipe dans chaque module.
 */

/** Relecture des comptes : ce qui arrive du site public paraît dans la minute. */
const POLL_MS = 60_000;

/** Événement par lequel un geste de lecture annonce les nouveaux comptes. */
const EVENT = "ugptn:notifications";

/**
 * Fait baisser une bulle sans attendre la prochaine relecture. Un événement de
 * fenêtre plutôt qu'un contexte : la cloche vit dans la coquille, les gestes
 * dans les pages, et aucun des deux ne doit dépendre de l'autre pour s'afficher.
 */
export function announceNotifications(partiel: Partial<Notifications>) {
  window.dispatchEvent(new CustomEvent<Partial<Notifications>>(EVENT, { detail: partiel }));
}

/**
 * Comptes par module, tenus à jour côté client.
 *
 * `initial` vient du serveur (cf. AdminShell) : les bulles s'affichent d'emblée,
 * sans apparaître après hydratation. Un module à `null` n'est pas accessible au
 * compte connecté : il n'est jamais affiché, et aucune annonce ne l'allume.
 *
 * ⚠️ La relecture périodique n'est pas un confort : un layout ne se re-rend pas
 * pendant la navigation (cf. docs Next, `layout.md`). Sans elle, les chiffres
 * calculés au premier chargement resteraient figés toute la session.
 */
export function useNotifications(initial: Notifications): Notifications {
  const [counts, setCounts] = useState(initial);

  // Le serveur peut renvoyer de nouvelles valeurs (rafraîchissement du routeur
  // après une action) : elles font foi sur l'état local. Comparées par valeur,
  // la carte étant un objet neuf à chaque rendu serveur.
  const cle = JSON.stringify(initial);
  const [derniereCle, setDerniereCle] = useState(cle);
  if (cle !== derniereCle) {
    setDerniereCle(cle);
    setCounts(initial);
  }

  const suivi = estSuivi(initial);

  useEffect(() => {
    if (!suivi) return;
    let actif = true;

    // Onglet masqué : personne ne regarde la cloche, inutile d'interroger la
    // base. Le retour sur l'onglet relit aussitôt.
    const relire = () => {
      if (document.visibilityState !== "visible") return;
      compterNotificationsAction().then(
        (valeurs) => { if (actif) setCounts(valeurs); },
        // Réseau coupé, base injoignable : les derniers chiffres restent
        // affichés, la relecture suivante les corrigera.
        () => {},
      );
    };

    const surAnnonce = (event: Event) => {
      const partiel = (event as CustomEvent<Partial<Notifications>>).detail ?? {};
      setCounts((precedent) => {
        const suite = { ...precedent };
        for (const cle of NOTIFICATION_KEYS) {
          const valeur = partiel[cle];
          if (typeof valeur === "number" && precedent[cle] !== null) suite[cle] = valeur;
        }
        return suite;
      });
    };

    const minuterie = window.setInterval(relire, POLL_MS);
    document.addEventListener("visibilitychange", relire);
    window.addEventListener(EVENT, surAnnonce);

    return () => {
      actif = false;
      window.clearInterval(minuterie);
      document.removeEventListener("visibilitychange", relire);
      window.removeEventListener(EVENT, surAnnonce);
    };
  }, [suivi]);

  return counts;
}

/** Bulle de compte. Muette pour les lecteurs d'écran : ce qui la porte dit le nombre en toutes lettres. */
export function UnreadBubble({ count }: { count: number | null }) {
  if (!count || count <= 0) return null;
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
 * La cloche : le total des modules suivis, et un menu qui en donne le détail.
 *
 * Elle double les bulles de la barre latérale parce que, sur mobile, cette
 * barre devient un ruban qui défile : un module peut sortir de l'écran, la
 * barre du haut non.
 *
 * Motif de DIVULGATION (bouton `aria-expanded` qui montre une liste de liens),
 * et non de menu applicatif : les entrées sont des liens ordinaires, que le
 * clavier parcourt à la tabulation comme partout ailleurs dans la console.
 */
export function NotificationBell({ counts }: { counts: Notifications }) {
  const [ouvert, setOuvert] = useState(false);
  const racine = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const idMenu = useId();

  const total = totalNotifications(counts);
  const suivis = NOTIFICATION_KEYS.filter((cle) => counts[cle] !== null);

  // Fermeture au clic à l'extérieur et à la touche Échap, qui rend le focus au
  // bouton : sans cela, le clavier repartirait du haut de la page.
  useEffect(() => {
    if (!ouvert) return;

    const surPointeur = (event: PointerEvent) => {
      if (!racine.current?.contains(event.target as Node)) setOuvert(false);
    };
    const surTouche = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOuvert(false);
      bouton.current?.focus();
    };

    document.addEventListener("pointerdown", surPointeur);
    document.addEventListener("keydown", surTouche);
    return () => {
      document.removeEventListener("pointerdown", surPointeur);
      document.removeEventListener("keydown", surTouche);
    };
  }, [ouvert]);

  const libelle = total > 0 ? `${ADMIN.shell.notifications} : ${total}` : ADMIN.shell.notificationsAucune;

  return (
    <div className="adm-bell-wrap" ref={racine}>
      <button
        ref={bouton}
        type="button"
        className="adm-bell"
        aria-expanded={ouvert}
        aria-controls={idMenu}
        aria-label={libelle}
        title={libelle}
        onClick={() => setOuvert((valeur) => !valeur)}
      >
        <BellIcon />
        <UnreadBubble count={total} />
      </button>

      {ouvert && (
        <div id={idMenu} className="adm-bell-menu">
          <div className="adm-bell-menu__titre">{ADMIN.shell.notifications}</div>
          <ul className="adm-bell-menu__liste">
            {suivis.map((cle) => {
              const count = counts[cle] ?? 0;
              return (
                <li key={cle}>
                  <Link
                    href={lienNotification(cle, count)}
                    className={`adm-bell-menu__item${count > 0 ? "" : " is-vide"}`}
                    onClick={() => setOuvert(false)}
                  >
                    <span>{resumeNotification(cle, count)}</span>
                    <span className="adm-bell-menu__fin">
                      <UnreadBubble count={count} />
                      <span className="mono" aria-hidden>→</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
