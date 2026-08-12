import type { Metadata } from "next";
import { ADMIN } from "@/content/admin";
import { AdminLoginForm } from "@/components/dashboard/AdminLoginForm";

export const metadata: Metadata = { title: ADMIN.login.title };

/**
 * Index de la console = écran de connexion.
 * `src/proxy.ts` renvoie ici toute requête non authentifiée du sous-arbre, et
 * renvoie vers le tableau de bord si une session valide est déjà présente.
 */
export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
