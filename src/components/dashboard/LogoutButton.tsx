"use client";

import { useFormStatus } from "react-dom";
import { logoutAction } from "@/actions/admin-auth";
import { ADMIN } from "@/content/admin";

/**
 * Icône de sortie. Dessinée ici comme le chevron de la barre : c'est de la
 * chrome, pas un module — même grille 24×24, trait de 1,5 px, angles vifs.
 */
const SignOutIcon = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="butt"
    strokeLinejoin="miter"
    aria-hidden
    focusable="false"
  >
    <path d="M13 4H5v16h8" />
    <path d="M14 12h8" />
    <path d="M18 8l4 4-4 4" />
  </svg>
);

/**
 * Corps du bouton. Séparé du `<form>` parce que `useFormStatus` ne rapporte
 * l'état que d'un formulaire ANCESTRAL : appelé dans le composant qui rend le
 * `<form>`, il renverrait toujours « au repos ».
 *
 * La déconnexion révoque la session en base puis redirige : sur une connexion
 * lente, l'attente est perceptible et sans retour, on clique deux fois. Le
 * libellé bascule, comme partout ailleurs dans la console.
 */
function SignOutContent() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="adm__signout" disabled={pending} title={ADMIN.shell.logout}>
      <span className="adm__nav-ico"><SignOutIcon /></span>
      <span className="adm__nav-text">{pending ? ADMIN.shell.loggingOut : ADMIN.shell.logout}</span>
    </button>
  );
}

/**
 * Déconnexion, logée au pied de la barre latérale.
 *
 * L'action délègue à Better Auth, qui révoque la session en base et expire le
 * cookie (cf. actions/admin-auth.ts).
 *
 * Même structure que les entrées de navigation (`adm__nav-ico` + `adm__nav-text`)
 * pour que le libellé s'escamote avec les autres quand la barre est repliée,
 * tout en restant annoncé par un lecteur d'écran.
 */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <SignOutContent />
    </form>
  );
}
