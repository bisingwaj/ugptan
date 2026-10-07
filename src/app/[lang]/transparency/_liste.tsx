import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { SITE_URL } from "@/lib/site";
import { NAV, route } from "@/lib/routes";
import { listerCategoriesDoc, listerDocuments, listerTypesDoc } from "@/lib/docs/query";
import { isDocTri, isDocType, type DocTri, type DocType } from "@/lib/docs/statut";
import { parametre, type ParametresBruts } from "@/lib/url/listes";
import { PageHero } from "@/components/ui/PageHero";
import { RessourcesListeUrl } from "@/components/url/RessourcesListeUrl";
import { Reveal } from "@/components/motion/Reveal";
import { metaPage } from "@/lib/seo";

/**
 * Rendu de la page « Rapports & analyses », partagé par ses deux routes : la
 * liste nue prérendue (`page.tsx`) et la variante filtrée rendue à la demande
 * (`%5Ffiltre/page.tsx`), vers laquelle le proxy réécrit les requêtes portant
 * `?categorie=`, `?type=`, `?q=` ou `?tri=` (cf. lib/url/listes.ts, qui dit
 * aussi pourquoi le filtrage reste serveur).
 *
 * `?doc=` n'en fait pas partie : il ouvre la fiche d'un document sans changer
 * la liste, et se lit côté client (components/url/RessourcesListeUrl.tsx).
 */

export type FiltresDocs = {
  categorie: string | null;
  type: DocType | null;
  q: string | null;
  /** `null` : aucun tri demandé — l'ordre éditorial (`RANG`) s'applique. */
  tri: DocTri | null;
};

export const SANS_FILTRE: FiltresDocs = { categorie: null, type: null, q: null, tri: null };

/** Lecture des paramètres de la variante filtrée — tolère un paramètre répété. */
export function lireFiltresDocs(brut: ParametresBruts): FiltresDocs {
  const type = parametre(brut, "type");
  const tri = parametre(brut, "tri");
  return {
    categorie: parametre(brut, "categorie"),
    type: type && isDocType(type) ? type : null,
    q: parametre(brut, "q"),
    tri: tri && isDocTri(tri) ? tri : null,
  };
}

/**
 * Les mêmes métadonnées pour les deux routes : une liste filtrée se rattache à
 * la liste complète, dont elle reprend le canonical.
 */
export function metaRessources(lang: Lang): Metadata {
  const t = dict(lang);
  return metaPage({ lang, path: NAV.transparence, title: t.ressources.titre, description: t.ressources.lead });
}

/** Reconstruit l'URL de la liste en conservant les filtres actifs. */
function lien(lang: string, filtres: FiltresDocs, changement: Partial<FiltresDocs>): string {
  const query = new URLSearchParams();
  const fusion = { ...filtres, ...changement };
  for (const [cle, valeur] of Object.entries(fusion)) {
    if (!valeur) continue;
    query.set(cle, String(valeur));
  }
  const suffixe = query.toString();
  const base = `/${lang}${NAV.transparence}`;
  return suffixe ? `${base}?${suffixe}` : base;
}

export async function RessourcesListePage({ lang, filtres }: { lang: Lang; filtres: FiltresDocs }) {
  const t = dict(lang);
  const r = t.ressources;
  const { categorie, type, q } = filtres;
  const tri: DocTri = filtres.tri ?? "RANG";

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
              <span className="mono" style={{ fontSize: 11, color: "var(--c-60)" }}>{r.sortBy}</span>
              {([["RANG", r.sortRank], ["DATE", r.sortDate], ["TITRE", r.sortTitle]] as const).map(
                ([valeur, label]) => (
                  <Link
                    key={valeur}
                    href={lien(lang, filtres, { tri: valeur })}
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
                href={lien(lang, filtres, { categorie: null })}
                className={categorie ? "chip" : "chip chip--on"}
                scroll={false}
              >
                {r.all}
              </Link>
              {categories.map((item) => (
                <Link
                  key={item.slug}
                  href={lien(lang, filtres, { categorie: item.slug })}
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
                href={lien(lang, filtres, { type: null })}
                className={type ? "chip" : "chip chip--on"}
                scroll={false}
              >
                {r.all}
              </Link>
              {types.map((item) => (
                <Link
                  key={item.type}
                  href={lien(lang, filtres, { type: item.type })}
                  className={type === item.type ? "chip chip--on" : "chip"}
                  scroll={false}
                >
                  {item.nom} <span style={{ opacity: 0.6 }}>{item.total}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Intitulé lu, non vu : relie le `h1` du héros aux `h3` des fiches. */}
          <h2 className="sr-only">{r.listeTitre}</h2>

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
            <RessourcesListeUrl documents={documents} lang={lang} />
          )}

          <Reveal variant="fade">
            <p className="doc-mention">{r.disclaimer}</p>
          </Reveal>
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
