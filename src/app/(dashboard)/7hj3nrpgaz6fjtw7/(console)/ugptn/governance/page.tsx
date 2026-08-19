import type { Metadata } from "next";
import { ADMIN_GOUVERNANCE } from "@/content/admin";
import { requirePermission } from "@/lib/auth/guard";
import { ensureActivites, ensureOrganes } from "@/lib/gouvernance/bootstrap";
import { chargerActivites, chargerOrganes } from "@/lib/gouvernance/edition";
import { EcranGouvernance } from "@/components/dashboard/gouvernance/EcranGouvernance";
import { vuesDePlusieurs } from "@/lib/ia/suivi";

export const metadata: Metadata = { title: ADMIN_GOUVERNANCE.title };

export default async function GouvernanceAdminPage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée.
  await requirePermission("ugptn");
  // Reprise du contenu d'origine du site, ligne par ligne et une seule fois.
  await Promise.all([ensureOrganes(), ensureActivites()]);

  const [organes, activites] = await Promise.all([chargerOrganes(), chargerActivites()]);

  // Une requête par famille pour l'écran entier, plutôt qu'une par carte.
  const [etatsIAOrganes, etatsIAActivites] = await Promise.all([
    vuesDePlusieurs("organe", organes.map((organe) => organe.id)),
    vuesDePlusieurs("gouvActivite", activites.map((activite) => activite.id)),
  ]);

  return (
    <EcranGouvernance
      organes={organes}
      activites={activites}
      etatsIAOrganes={etatsIAOrganes}
      etatsIAActivites={etatsIAActivites}
    />
  );
}
