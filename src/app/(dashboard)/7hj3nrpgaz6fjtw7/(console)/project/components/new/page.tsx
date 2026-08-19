import type { Metadata } from "next";
import { ADMIN_PROJET } from "@/content/admin";
import { requirePermission } from "@/lib/auth/guard";
import { EcranNouvelleComposante } from "@/components/dashboard/projet/EcranComposantes";

export const metadata: Metadata = { title: ADMIN_PROJET.nouvelle };

export default async function NouvelleComposantePage() {
  await requirePermission("projet");
  return <EcranNouvelleComposante />;
}
