import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { SITE_URL } from "@/lib/site";
import { NAV, route } from "@/lib/routes";
import { listerCategoriesDoc, listerDocuments, listerTypesDoc } from "@/lib/docs/query";
import { isDocTri, isDocType, type DocTri, type DocType } from "@/lib/docs/statut";
import { PageHero } from "@/components/ui/PageHero";
import { RessourcesListe } from "@/components/docs/RessourcesListe";

/**
 * Cinq minutes de cache.
 *
 * Plus long que la page « Actualités » (deux minutes) : un rapport ne se publie
 * pas à la minute, et rien ici ne se périme tout seul — aucun classement ne
 * dépend de l'instant présent, contrairement aux événements. Les écritures de la
 * console invalident en plus explicitement cette route
 * (cf. lib/docs/cache.ts), donc une publication paraît au premier rechargement.
 */
export const revalidate = 300;

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang).ressources;

  return {
    title: t.titre,
    description: t.lead,
    alternates: {
      canonical: `/${lang}${NAV.transparence}`,
      languages: { fr: `/fr${NAV.transparence}`, en: `/en${NAV.transparence}` },
    },
    openGraph: {
      title: `${t.titre} · UGPTN`,
      description: t.lead,
      url: `${SITE_URL}/${lang}${NAV.transparence}`,
      type: "website",
    },
  };
}

type Recherche = { categorie?: string; type?: string; q?: string; tri?: string; doc?: string };

/** Reconstruit l'URL de la liste en conservant les filtres actifs. */
function lien(lang: string, params: Recherche, changement: Partial<Recherche>): string {
  const query = new URLSearchParams();
  const fusion = { ...params, ...changement, doc: undefined };
  for (const [cle, valeur] of Object.entries(fusion)) {
    if (!valeur) continue;
    query.set(cle, String(valeur));
  }
  const suffixe = query.toString();
  const base = `/${lang}${NAV.transparence}`;
  return suffixe ? `${base}?${suffixe}` : base;
}

export default async function RessourcesPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Recherche>;
}) {
  const [params, recherche] = await Promise.all([props.params, props.searchParams]);
  const lang = asLang(params.lang);
  const t = dict(lang);
  const r = t.ressources;

  const categorie = recherche.categorie?.trim() || null;
  const type: DocType | null = recherche.type && isDocType(recherche.type) ? recherche.type : null;
  const q = recherche.q?.trim() || null;
  const tri: DocTri = recherche.tri && isDocTri(recherche.tri) ? recherche.tri : "RANG";

  const [documents, categories, types] = await Promise.all([
    listerDocuments({ lang, categorie, type, recherche: q, tri }),
    listerCategoriesDoc(lang),
    listerTypesDoc(lang),
  ]);

  const filtre = Boolean(categorie || type || q);

  /**
   * Données structurées : la page est un CATALOGUE de pièces publiées.
   * `ItemList` de `DigitalDocument` est ce que les moteurs comprennent d'une
   * telle liste — chaque entrée porte son adresse, sa date et son auteur,
   * exactement ce qui permet de la proposer en résultat direct.
   *
   * L'URL annoncée est celle de la PAGE pour une publication rédigée, celle du
   * FICHIER pour une pièce téléversée : c'est là que le visiteur trouvera le
   * contenu, et annoncer l'autre le ferait atterrir à côté. La signature de
   * l'auteur prime sur l'organisme producteur, pour la même raison qu'à
   * l'écran : c'est elle qui dit qui a écrit.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: r.titre,
    description: r.lead,
    url: `${SITE_URL}/${lang}${NAV.transparence}`,
    numberOfItems: documents.length,
    itemListElement: documents.map((document, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "DigitalDocument",
        name: document.titre,
        ...(document.description ? { description: document.description } : {}),
        ...(document.dateISO ? { datePublished: document.dateISO } : {}),
        ...(document.signature
          ? { author: { "@type": "Person", name: document.signature.nom } }
          : document.auteur
            ? { author: { "@type": "Organization", name: document.auteur } }
            : {}),
        ...(document.categorie ? { genre: document.categorie.nom } : {}),
        inLanguage: lang,
        ...(document.fichier ? { encodingFormat: document.fichier.mime } : {}),
        url: document.redige
          ? `${SITE_URL}${document.chemin}`
          : (document.fichier?.url ?? `${SITE_URL}/${lang}${NAV.transparence}?doc=${document.id}`),
      },
    })),
  };

  return (
    <div>
      <PageHero crumb={`UGPTN / ${r.titre}`} title={r.hero} lead={r.lead} />

      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          {/* Recherche et tri : un formulaire GET, donc partageable par URL,
              rejouable par le bouton « précédent » et fonctionnel sans
              JavaScript. Les filtres actifs voyagent en champs cachés. */}
          <div className="actu-barre">
            <form method="get" role="search" className="actu-recherche">
              {categorie && <input type="hidden" name="categorie" value={categorie} />}
              {type && <input type="hidden" name="type" value={type} />}
              {tri !== "RANG" && <input type="hidden" name="tri" value={tri} />}
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder={r.search}
                aria-label={r.search}
                className="actu-recherche__champ"
              />
              <button type="submit" className="btn btn--outline btn--sm">{r.searchAction}</button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--c-50)" }}>{r.sortBy}</span>
              {([["RANG", r.sortRank], ["DATE", r.sortDate], ["TITRE", r.sortTitle]] as const).map(
                ([valeur, label]) => (
                  <Link
                    key={valeur}
                    href={lien(lang, recherche, { tri: valeur })}
                    className={tri === valeur ? "chip chip--on" : "chip"}
                    scroll={false}
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>
          </div>

          {categories.length > 0 && (
            <nav className="doc-filtres" aria-label={r.filterCategory}>
              <span className="doc-filtres__label mono">{r.filterCategory}</span>
              <Link
                href={lien(lang, recherche, { categorie: undefined })}
                className={categorie ? "chip" : "chip chip--on"}
                scroll={false}
              >
                {r.all}
              </Link>
              {categories.map((item) => (
                <Link
                  key={item.slug}
                  href={lien(lang, recherche, { categorie: item.slug })}
                  className={categorie === item.slug ? "chip chip--on" : "chip"}
                  scroll={false}
                >
                  {item.nom} <span style={{ opacity: 0.6 }}>{item.total}</span>
                </Link>
              ))}
            </nav>
          )}

          {types.length > 1 && (
            <nav className="doc-filtres" aria-label={r.filterType}>
              <span className="doc-filtres__label mono">{r.filterType}</span>
              <Link
                href={lien(lang, recherche, { type: undefined })}
                className={type ? "chip" : "chip chip--on"}
                scroll={false}
              >
                {r.all}
              </Link>
              {types.map((item) => (
                <Link
                  key={item.type}
                  href={lien(lang, recherche, { type: item.type })}
                  className={type === item.type ? "chip chip--on" : "chip"}
                  scroll={false}
                >
                  {item.nom} <span style={{ opacity: 0.6 }}>{item.total}</span>
                </Link>
              ))}
            </nav>
          )}

          <div className="doc-compte">
            <span className="mono">{r.count(documents.length)}</span>
            {filtre && (
              <Link href={route(lang, NAV.transparence)} className="actu-avis__lien" scroll={false}>
                {r.reset}
              </Link>
            )}
          </div>

          {documents.length === 0 ? (
            <p className="actu-vide">{filtre ? r.noResult : r.empty}</p>
          ) : (
            <RessourcesListe
              documents={documents}
              lang={lang}
              ouvertParDefaut={recherche.doc ?? null}
            />
          )}

          <p className="doc-mention">{r.disclaimer}</p>
        </div>
      </section>

      {documents.length > 0 && (
        <script
          type="application/ld+json"
          // Sérialisation d'un objet que nous construisons : aucune chaîne
          // arbitraire n'y entre sans passer par JSON.stringify, qui échappe les
          // séquences dangereuses des valeurs.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
    </div>
  );
}
