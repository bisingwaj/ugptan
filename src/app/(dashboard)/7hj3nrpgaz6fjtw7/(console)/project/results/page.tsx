import type { Metadata } from "next";
import { ADMIN_PROJET } from "@/content/admin";
import { requirePermission } from "@/lib/auth/guard";
import { ensureIndicateurs } from "@/lib/projet/bootstrap";
import { chargerIndicateurs } from "@/lib/projet/edition";
import { IndicateurFamilleListe } from "@/components/dashboard/projet/IndicateurFamilleListe";

export const metadata: Metadata = { title: ADMIN_PROJET.resultatsTitle };

export default async function ResultatsAdminPage() {
  await requirePermission("projet");
  // Reprise du cadre de résultats d'origine, indicateur par indicateur et une
  // seule fois.
  await ensureIndicateurs();

  // Deux lectures menées de front : aucune ne conditionne l'autre.
  const [odp, intermediaires] = await Promise.all([
    chargerIndicateurs("ODP"),
    chargerIndicateurs("INTERMEDIAIRE"),
  ]);

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{ADMIN_PROJET.resultatsTitle}</h1>
          <p className="adm__lead">{ADMIN_PROJET.resultatsLead}</p>
        </div>
      </div>

      <IndicateurFamilleListe famille="ODP" indicateurs={odp} />
      <IndicateurFamilleListe famille="INTERMEDIAIRE" indicateurs={intermediaires} />
    </>
  );
}
