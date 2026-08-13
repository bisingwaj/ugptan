import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_ACTUS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { TaxonomieForm } from "@/components/dashboard/actus/TaxonomieForm";

export const metadata: Metadata = { title: ADMIN_ACTUS.taxoTitle };

/**
 * Catégories et étiquettes sur un même écran.
 *
 * Réunies parce qu'on les arbitre ensemble : décider qu'« Inclusion » est une
 * catégorie ou une étiquette suppose de voir les deux listes en même temps.
 */
export default async function TaxonomiesPage() {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("actualites");
  const t = ADMIN_ACTUS;

  const [categories, etiquettes] = await Promise.all([
    db().articleCategory.findMany({
      select: {
        id: true, slug: true, nomFr: true, nomEn: true, color: true, position: true,
        _count: { select: { articles: true } },
      },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
    db().tag.findMany({
      select: { id: true, slug: true, nomFr: true, nomEn: true, _count: { select: { articles: true } } },
      orderBy: { nomFr: "asc" },
    }),
  ]);

  return (
    <>
      <Link href={adminPath("/actualites")} className="adm-back">← {t.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{t.taxoTitle}</h1>
      <p className="adm__lead">{t.taxoLead}</p>

      {/* ---------------- Catégories ---------------- */}
      <div className="adm__section-title">{t.categoriesTitle}</div>
      <p className="adm__lead" style={{ marginTop: 0, marginBottom: 16 }}>{t.categoriesLead}</p>

      {categories.length === 0 ? (
        <div className="adm-list"><div className="adm-list__row">{t.categoriesVide}</div></div>
      ) : (
        <div className="adm-taxo">
          {categories.map((categorie) => (
            <TaxonomieForm
              key={categorie.id}
              genre="categorie"
              item={{
                id: categorie.id,
                slug: categorie.slug,
                nomFr: categorie.nomFr,
                nomEn: categorie.nomEn,
                color: categorie.color,
                position: categorie.position,
                usage: categorie._count.articles,
              }}
            />
          ))}
        </div>
      )}

      <div className="adm-panel" style={{ marginTop: 18 }}>
        <div className="label-mono">Nouvelle catégorie</div>
        <TaxonomieForm genre="categorie" />
      </div>

      {/* ---------------- Étiquettes ---------------- */}
      <div className="adm__section-title">{t.etiquettesTitle}</div>
      <p className="adm__lead" style={{ marginTop: 0, marginBottom: 16 }}>{t.etiquettesLead}</p>

      {etiquettes.length === 0 ? (
        <div className="adm-list"><div className="adm-list__row">{t.etiquettesVide}</div></div>
      ) : (
        <div className="adm-taxo">
          {etiquettes.map((etiquette) => (
            <TaxonomieForm
              key={etiquette.id}
              genre="etiquette"
              item={{
                id: etiquette.id,
                slug: etiquette.slug,
                nomFr: etiquette.nomFr,
                nomEn: etiquette.nomEn,
                usage: etiquette._count.articles,
              }}
            />
          ))}
        </div>
      )}

      <div className="adm-panel" style={{ marginTop: 18 }}>
        <div className="label-mono">Nouvelle étiquette</div>
        <TaxonomieForm genre="etiquette" />
      </div>
    </>
  );
}
