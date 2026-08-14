import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_EVTS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { requirePermission } from "@/lib/auth/guard";
import { EvtCategorieForm } from "@/components/dashboard/events/EvtCategorieForm";

export const metadata: Metadata = { title: ADMIN_EVTS.categoriesTitle };

/**
 * Catégories d'événements.
 *
 * Pas d'étiquettes en vis-à-vis, contrairement à l'écran jumeau des actualités :
 * un événement se classe par sa nature (forum, atelier, consultation), et cette
 * nature est unique. Ajouter un second axe transverse n'apporterait rien tant
 * que le calendrier tient sur quelques dizaines d'entrées par an.
 */
export default async function CategoriesEvenementsPage() {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("evenements");
  const t = ADMIN_EVTS;

  // Reprise sur panne de liaison (cf. lib/lecture.ts).
  const categories = await lectureConsole(
    () => db().evenementCategory.findMany({
      select: {
        id: true, slug: true, nomFr: true, nomEn: true, color: true, position: true,
        _count: { select: { evenements: true } },
      },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
    "catégories d'événements (console)",
  );

  return (
    <>
      <Link href={adminPath("/events")} className="adm-back">← {t.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{t.categoriesTitle}</h1>
      <p className="adm__lead">{t.categoriesLead}</p>

      {categories.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{t.categoriesVide}</div>
        </div>
      ) : (
        <div className="adm-taxo" style={{ marginTop: 18 }}>
          {categories.map((categorie) => (
            <EvtCategorieForm
              key={categorie.id}
              item={{
                id: categorie.id,
                slug: categorie.slug,
                nomFr: categorie.nomFr,
                nomEn: categorie.nomEn,
                color: categorie.color,
                position: categorie.position,
                usage: categorie._count.evenements,
              }}
            />
          ))}
        </div>
      )}

      <div className="adm-panel" style={{ marginTop: 18 }}>
        <div className="label-mono">Nouvelle catégorie</div>
        <EvtCategorieForm />
      </div>
    </>
  );
}
