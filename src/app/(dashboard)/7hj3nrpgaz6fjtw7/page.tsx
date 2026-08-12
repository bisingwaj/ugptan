import { redirect } from "next/navigation";
import { ADMIN_HOME, ADMIN_LOGIN } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth/guard";

/**
 * Index de la console : un aiguillage, sans écran propre.
 *
 * La connexion a sa page dédiée (`/signin`) depuis que les comptes existent en
 * base : garder le formulaire sur l'index obligerait à traiter la racine du
 * sous-arbre à la fois comme page publique et comme zone protégée.
 */
export default async function AdminIndexPage() {
  const user = await getCurrentUser();
  redirect(user ? ADMIN_HOME : ADMIN_LOGIN);
}
