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

  // Au-delà d'un an, la source du gouverneur est signalée « à revérifier ».
  // Calculée ici plutôt qu'au rendu client : une seule horloge, pas d'écart
  // d'hydratation.
  const limite = new Date();
  limite.setUTCFullYear(limite.getUTCFullYear() - 1);

  return (
    <EcranProvinces
      fiches={fiches}
      projets={projets}
      provinces={optionsProvinces()}
      composantes={composantes}
      etatsIAFiches={etatsIAFiches}
      etatsIAProjets={etatsIAProjets}
      dateLimite={limite.toISOString().slice(0, 10)}
    />
  );
}
