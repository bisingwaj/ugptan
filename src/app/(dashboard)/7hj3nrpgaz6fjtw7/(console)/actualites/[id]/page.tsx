import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_ACTUS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { formatDateTime, fromDateTimeLocal } from "@/lib/format";
import { LOCALES } from "@/lib/params";
import { APERCU_PARAM, signerApercu } from "@/lib/actus/apercu";
import { chargerArticle, chargerReferentiels } from "@/lib/actus/edition";
import { STATUT_LABEL, statutEffectif } from "@/lib/actus/statut";
import { ArticleActions } from "@/components/dashboard/actus/ArticleActions";
import { ArticleEditeur } from "@/components/dashboard/actus/ArticleEditeur";

export const metadata: Metadata = { title: ADMIN_ACTUS.modifier };

type Recherche = { cree?: string; copie?: string };

export default async function ModifierArticlePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Recherche>;
}) {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("actualites");

  const { id } = await props.params;
  const params = await props.searchParams;
  const t = ADMIN_ACTUS;

  const [article, referentiels] = await Promise.all([chargerArticle(id), chargerReferentiels()]);
  if (!article) notFound();

  const publieLe = fromDateTimeLocal(article.publishedAt);
  const effectif = statutEffectif(article.status, publieLe);
  const enLigne = effectif === "PUBLISHED";

  // Le lien d'aperçu porte un jeton signé : il vaut par lui-même, pour être
  // transmis à un relecteur sans compte (cf. lib/actus/apercu.ts).
  const jeton = await signerApercu(article.id).catch(() => null);
  const apercuUrl = jeton ? `/fr/actualites/apercu?${APERCU_PARAM}=${jeton}` : null;

  const titre = article.traductions.fr.title || article.traductions.en.title || "(sans titre)";

  return (
    <>
      <Link href={adminPath("/actualites")} className="adm-back">← {t.retourListe}</Link>

      <div className="adm-entete" style={{ marginTop: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="adm__title">{titre}</h1>
          <div className="adm-entete__meta">
            <span className={`adm-badge adm-statut adm-statut--${effectif.toLowerCase()}`}>
              {STATUT_LABEL[effectif]}
            </span>

            {/* État de chaque langue, visible sans ouvrir les onglets : c'est
                ce qui reste à traduire, dit d'un coup d'œil. */}
            <span className="adm-langues">
              {LOCALES.map((locale) => {
                const tr = article.traductions[locale];
                const etat = !tr.existe ? t.tradManquante : tr.complete ? t.tradPresente : t.tradIncomplete;
                return (
                  <span
                    key={locale}
                    className={`adm-langue${tr.complete ? " is-on" : tr.existe ? " is-partiel" : ""}`}
                    title={`${locale.toUpperCase()} · ${etat}`}
                  >
                    {locale.toUpperCase()}
                  </span>
                );
              })}
            </span>

            <span className="mono adm-hint">
              {publieLe ? `${t.colDate} : ${formatDateTime(publieLe)}` : t.jamaisPublie}
            </span>

            {enLigne && article.traductions.fr.existe && (
              <a
                href={`/fr/actualites/${article.traductions.fr.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-link"
                style={{ fontSize: 13 }}
              >
                Voir sur le site ↗
              </a>
            )}
          </div>
        </div>
        <ArticleActions id={article.id} enLigne={enLigne} />
      </div>

      {params.cree && <div className="adm-ok" role="status" style={{ marginTop: 16 }}>{t.creeOk}</div>}
      {params.copie && <div className="adm-ok" role="status" style={{ marginTop: 16 }}>{t.copieOk}</div>}

      <div style={{ marginTop: 26 }}>
        <ArticleEditeur
          article={article}
          referentiels={referentiels.referentiels}
          assets={referentiels.assets}
          apercuUrl={apercuUrl}
        />
      </div>
    </>
  );
}
