import { logoutAction } from "@/actions/admin-auth";
import { ADMIN } from "@/content/admin";

/** Composant serveur : un `<form action={…}>` suffit, pas besoin de client. */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="btn btn--on-dark btn--sm">{ADMIN.shell.logout} →</button>
    </form>
  );
}
