/* ============================================================================
   Les trois écrans des composantes — liste, création, fiche.

   Les pages de routes ne font que garder la permission et appeler ces
   composants : c'est ici que vit tout ce qui est commun aux trois.
   ========================================================================== */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_PROJET } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { LOCALES } from "@/lib/params";
import {
  chargerComposante, chargerReferentielsProjet, composanteVierge,
} from "@/lib/projet/edition";
import {
  COMPOSANTE_SECTIONS, COMPOSANTE_SECTION_LABEL, PROJET_STATUT_LABEL,
  SECTION_BLOCS, composanteTraduite, type ProjetStatut,
} from "@/lib/projet/statut";
import { ComposanteActions } from "@/components/dashboard/projet/ComposanteActions";
import { ComposanteCreation } from "@/components/dashboard/projet/ComposanteCreation";
import { ComposanteEditeur } from "@/components/dashboard/projet/ComposanteEditeur";

const BASE = adminPath("/project/components");

/* -------------------------------------------------------------------------- */
/* Liste                                                                       */
/* -------------------------------------------------------------------------- */

export async function EcranListeComposantes({ params }: { params: { supprime?: string } }) {
  const t = ADMIN_PROJET;

  // Reprise sur panne de liaison (cf. lib/lecture.ts) : le transport vers Neon
  // échoue par salves, et la liste du module ne doit pas en dépendre.
  const composantes = await lectureConsole(
    () => db().composante.findMany({
      orderBy: [{ position: "asc" }, { code: "asc" }],
      select: {
        id: true, code: true, status: true, position: true, color: true,
        translations: { select: { locale: true, titre: true } },
        blocs: { select: { type: true } },
      },
    }),
    "liste des composantes (console)",
  );

  /** Sections qui portent au moins une entrée — ce qui reste à écrire, en un chiffre. */
  const sectionsAvecListes = COMPOSANTE_SECTIONS.filter((cle) => SECTION_BLOCS[cle].length > 0);

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{t.composantesTitle}</h1>
          <p className="adm__lead">{t.composantesLead}</p>
        </div>
        <div className="adm-entete__actions">
          <Link href={`${BASE}/new`} className="btn btn--primary">
            {t.nouvelle}<span className="arrow">→</span>
          </Link>
        </div>
      </div>

      {params.supprime && <div className="adm-ok" role="status" style={{ marginTop: 18 }}>{t.supprimeOk}</div>}

      {composantes.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{t.listeVide}</div>
        </div>
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 22 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">{t.colComposante}</th>
                <th scope="col">{t.colStatut}</th>
                <th scope="col">{t.colLangues}</th>
                <th scope="col">{t.colSections}</th>
                <th scope="col">{t.colOrdre}</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {composantes.map((composante) => {
                const trFr = composante.translations.find((tr) => tr.locale === "fr");
                const nom = trFr?.titre || composante.translations[0]?.titre || t.sansTitre;

                const types = new Set(composante.blocs.map((bloc) => bloc.type));
                const remplies = sectionsAvecListes.filter((cle) =>
                  SECTION_BLOCS[cle].some((type) => types.has(type)),
                );

                return (
                  <tr key={composante.id}>
                    <td>
                      <span
                        className="mono"
                        style={{ color: composante.color, marginRight: 10, fontWeight: 600 }}
                      >
                        {composante.code}
                      </span>
                      <Link href={`${BASE}/${composante.id}`} className="adm-link">{nom}</Link>
                    </td>
                    <td>
                      <span className={`adm-badge adm-statut adm-statut--${composante.status === "PUBLISHED" ? "published" : "draft"}`}>
                        {PROJET_STATUT_LABEL[composante.status as ProjetStatut]}
                      </span>
                    </td>
                    <td>
                      <span className="adm-langues">
                        {LOCALES.map((locale) => {
                          const tr = composante.translations.find((item) => item.locale === locale);
                          const complete = Boolean(tr && composanteTraduite(tr));
                          const etat = !tr ? t.tradManquante : complete ? t.tradPresente : t.tradIncomplete;
                          return (
                            <span
                              key={locale}
                              className={`adm-langue${complete ? " is-on" : tr ? " is-partiel" : ""}`}
                              title={`${locale.toUpperCase()} · ${etat}`}
                            >
                              {locale.toUpperCase()}
                            </span>
                          );
                        })}
                      </span>
                    </td>
                    <td className="adm-table__meta">
                      <span className="mono">{remplies.length}/{sectionsAvecListes.length}</span>
                      {remplies.length < sectionsAvecListes.length && (
                        <span className="adm-table__sub">
                          {sectionsAvecListes
                            .filter((cle) => !remplies.includes(cle))
                            .map((cle) => COMPOSANTE_SECTION_LABEL[cle])
                            .join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="mono adm-table__meta">{composante.position}</td>
                    <td>
                      <ComposanteActions
                        id={composante.id}
                        enLigne={composante.status === "PUBLISHED"}
                        compact
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Création                                                                    */
/* -------------------------------------------------------------------------- */

export async function EcranNouvelleComposante() {
  const t = ADMIN_PROJET;

  // La nouvelle composante se range après les existantes : une composante
  // ajoutée est un volet de plus, pas un volet qui passe devant.
  const dernier = await lectureConsole(
    () => db().composante.findFirst({ orderBy: { position: "desc" }, select: { position: true } }),
    "dernier rang des composantes",
  );

  const vierge = { ...composanteVierge(), position: (dernier?.position ?? -1) + 1 };

  return (
    <>
      <Link href={BASE} className="adm-back">← {t.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{t.nouvelle}</h1>
      <p className="adm__lead">{t.creationLead}</p>

      <div style={{ marginTop: 26 }}>
        <ComposanteCreation composante={vierge} />
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Fiche                                                                       */
/* -------------------------------------------------------------------------- */

export async function EcranFicheComposante({
  id,
  params,
}: {
  id: string;
  params: { cree?: string };
}) {
  const t = ADMIN_PROJET;

  const [composante, { referentiels, assets }] = await Promise.all([
    chargerComposante(id),
    chargerReferentielsProjet(id),
  ]);
  if (!composante) notFound();

  const enLigne = composante.status === "PUBLISHED";
  const titre = composante.traductions.fr.titre || composante.traductions.en.titre || t.sansTitre;

  /**
   * Lien vers la page publique. Il n'existe que si la composante est en ligne ET
   * traduite en français : un lien vers une page qui répond 404 donnerait à
   * croire qu'elle est déjà servie.
   */
  const publicUrl = enLigne && composante.traductions.fr.complete
    ? `/fr/components/${composante.slug}`
    : null;

  return (
    <>
      <Link href={BASE} className="adm-back">← {t.retourListe}</Link>

      <div className="adm-entete" style={{ marginTop: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="adm__title">
            <span className="mono" style={{ color: composante.color, marginRight: 12 }}>
              {composante.code}
            </span>
            {titre}
          </h1>
          <div className="adm-entete__meta">
            <span className={`adm-badge adm-statut adm-statut--${enLigne ? "published" : "draft"}`}>
              {PROJET_STATUT_LABEL[composante.status]}
            </span>

            <span className="mono adm-hint">/components/{composante.slug}</span>

            {/* État de chaque langue, visible sans ouvrir les onglets : c'est
                ce qui reste à traduire, dit d'un coup d'œil. */}
            <span className="adm-langues">
              {LOCALES.map((locale) => {
                const tr = composante.traductions[locale];
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

            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-link"
                style={{ fontSize: 13 }}
              >
                {t.voirSite} ↗
              </a>
            )}
          </div>
        </div>
        <ComposanteActions id={composante.id} enLigne={enLigne} />
      </div>

      {params.cree && <div className="adm-ok" role="status" style={{ marginTop: 16 }}>{t.creeOk}</div>}

      <div style={{ marginTop: 26 }}>
        <ComposanteEditeur composante={composante} referentiels={referentiels} assets={assets} />
      </div>
    </>
  );
}
