import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_DOCS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { requirePermission } from "@/lib/auth/guard";
import { ensureCategoriesDoc } from "@/lib/docs/bootstrap";
import { DocCategorieForm } from "@/components/dashboard/docs/DocCategorieForm";

export const metadata: Metadata = { title: ADMIN_DOCS.categoriesTitle };

/**
 * Catégories documentaires.
 *
 * Pas d'étiquettes en vis-à-vis, contrairement à l'écran jumeau des actualités :
 * une pièce se range par thématique, et le second axe — sa NATURE (rapport,
 * étude, note) — est une enum du schéma, pas un référentiel à administrer. Une
 * nature n'apparaît ni ne disparaît au rythme d'un projet.
 */
export default async function CategoriesDocumentsPage() {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("documents");
  await ensureCategoriesDoc();

  const t = ADMIN_DOCS;

  // Reprise sur panne de liaison (cf. lib/lecture.ts).
  const categories = await lectureConsole(
    () => db().documentCategory.findMany({
      select: {
        id: true, slug: true, nomFr: true, nomEn: true, color: true, position: true,
        _count: { select: { documents: true } },
      },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
    "catégories documentaires (console)",
  );

  return (
    <>
      <Link href={adminPath("/documents")} className="adm-back">← {t.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{t.categoriesTitle}</h1>
      <p className="adm__lead">{t.categoriesLead}</p>

      {categories.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{t.categoriesVide}</div>
        </div>
      ) : (
        <div className="adm-taxo" style={{ marginTop: 18 }}>
          {categories.map((categorie) => (
            <DocCategorieForm
              key={categorie.id}
              item={{
                id: categorie.id,
                slug: categorie.slug,
                nomFr: categorie.nomFr,
                nomEn: categorie.nomEn,
                color: categorie.color,
                position: categorie.position,
                usage: categorie._count.documents,
              }}
            />
          ))}
        </div>
      )}

      <div className="adm-panel" style={{ marginTop: 18 }}>
        <div className="label-mono">Nouvelle catégorie</div>
        <DocCategorieForm />
      </div>
    </>
  );
}
