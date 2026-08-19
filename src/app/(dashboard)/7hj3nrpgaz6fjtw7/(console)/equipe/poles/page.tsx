import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_EQUIPE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { ensureEquipe } from "@/lib/equipe/bootstrap";
import { chargerPoles } from "@/lib/equipe/edition";
import { PoleCarte, PoleCreation } from "@/components/dashboard/equipe/PoleForm";
import { vuesDePlusieurs } from "@/lib/ia/suivi";

export const metadata: Metadata = { title: ADMIN_EQUIPE.polesTitle };

export default async function PolesEquipePage() {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("equipe");
  await ensureEquipe();

  const t = ADMIN_EQUIPE;
  const poles = await chargerPoles();
  // Une requête pour toute la liste, plutôt qu'une par carte.
  const etatsIA = await vuesDePlusieurs("teamPole", poles.map((pole) => pole.id));

  return (
    <>
      <Link href={adminPath("/equipe")} className="adm-back">← {t.polesRetour}</Link>

      <div className="adm-entete" style={{ marginTop: 12 }}>
        <div>
          <h1 className="adm__title">{t.polesTitle}</h1>
          <p className="adm__lead">{t.polesLead}</p>
        </div>
      </div>

      <PoleCreation />

      {poles.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{t.poleVide}</div>
        </div>
      ) : (
        poles.map((pole, rang) => (
          <PoleCarte
            key={pole.id}
            pole={pole}
            premier={rang === 0}
            dernier={rang === poles.length - 1}
            etatIA={etatsIA.get(pole.id)?.en}
          />
        ))
      )}
    </>
  );
}
