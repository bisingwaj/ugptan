import type { Metadata } from "next";
import { ADMIN_PROVINCES } from "@/content/admin";
import { requirePermission } from "@/lib/auth/guard";
import { ensureFiches, ensureProjets } from "@/lib/provinces/bootstrap";
import { chargerFiches, chargerProjets, optionsProvinces } from "@/lib/provinces/edition";
import { referentielComposantes } from "@/lib/projet/query";
import { EcranProvinces } from "@/components/dashboard/provinces/EcranProvinces";
import { vuesDePlusieurs } from "@/lib/ia/suivi";

export const metadata: Metadata = { title: ADMIN_PROVINCES.title };

export default async function ProvincesAdminPage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée.
  await requirePermission("projet");
  // Reprise du contenu d'origine du site, ligne par ligne et une seule fois.
  await Promise.all([ensureFiches(), ensureProjets()]);

  const [fiches, projets, composantes] = await Promise.all([
    chargerFiches(),
    chargerProjets(),
    referentielComposantes(),
  ]);

  // Une requête par famille pour l'écran entier, plutôt qu'une par carte.
  const [etatsIAFiches, etatsIAProjets] = await Promise.all([
    vuesDePlusieurs("provinceFiche", fiches.map((fiche) => fiche.id)),
    vuesDePlusieurs("provinceProjet", projets.map((projet) => projet.id)),
  ]);

  return (
    <EcranProvinces
      fiches={fiches}
      projets={projets}
      provinces={optionsProvinces()}
      composantes={composantes}
      etatsIAFiches={etatsIAFiches}
      etatsIAProjets={etatsIAProjets}
    />
  );
}
