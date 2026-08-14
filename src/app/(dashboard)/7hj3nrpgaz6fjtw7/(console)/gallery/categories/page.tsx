import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_GALERIE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { requirePermission } from "@/lib/auth/guard";
import { ensureRubriquesGalerie } from "@/lib/galerie/bootstrap";
import { GalRubriqueForm } from "@/components/dashboard/galerie/GalRubriqueForm";

export const metadata: Metadata = { title: ADMIN_GALERIE.rubriquesTitle };

/**
 * Rubriques de la galerie.
 *
 * Un seul référentiel à administrer, comme du côté documentaire : le second axe
 * de la page publique — la NATURE, photo ou vidéo — est une enum du schéma, pas
 * une liste que l'on gère. Une galerie n'accueillera pas un troisième type de
 * média au rythme d'un projet.
 */
export default async function RubriquesGaleriePage() {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("videos");
  await ensureRubriquesGalerie();

  const t = ADMIN_GALERIE;

  // Reprise sur panne de liaison (cf. lib/lecture.ts).
  const rubriques = await lectureConsole(
    () => db().galerieCategory.findMany({
      select: {
        id: true, slug: true, nomFr: true, nomEn: true, color: true, position: true,
        _count: { select: { items: true } },
      },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
    "rubriques de la galerie (console)",
  );

  return (
    <>
      <Link href={adminPath("/gallery")} className="adm-back">← {t.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{t.rubriquesTitle}</h1>
      <p className="adm__lead">{t.rubriquesLead}</p>

      {rubriques.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{t.rubriquesVide}</div>
        </div>
      ) : (
        <div className="adm-taxo" style={{ marginTop: 18 }}>
          {rubriques.map((rubrique) => (
            <GalRubriqueForm
              key={rubrique.id}
              item={{
                id: rubrique.id,
                slug: rubrique.slug,
                nomFr: rubrique.nomFr,
                nomEn: rubrique.nomEn,
                color: rubrique.color,
                position: rubrique.position,
                usage: rubrique._count.items,
              }}
            />
          ))}
        </div>
      )}

      <div className="adm-panel" style={{ marginTop: 18 }}>
        <div className="label-mono">Nouvelle rubrique</div>
        <GalRubriqueForm />
      </div>
    </>
  );
}
