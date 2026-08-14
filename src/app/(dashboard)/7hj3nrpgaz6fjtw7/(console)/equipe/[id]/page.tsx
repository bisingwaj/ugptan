import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_EQUIPE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { LOCALES } from "@/lib/params";
import { chargerMembre, chargerReferentielsEquipe } from "@/lib/equipe/edition";
import { TEAM_STATUT_LABEL } from "@/lib/equipe/statut";
import { MembreActions } from "@/components/dashboard/equipe/MembreActions";
import { MembreEditeur } from "@/components/dashboard/equipe/MembreEditeur";

export const metadata: Metadata = { title: ADMIN_EQUIPE.title };

type Recherche = { cree?: string };

export default async function ModifierMembrePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Recherche>;
}) {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("equipe");

  const { id } = await props.params;
  const params = await props.searchParams;
  const t = ADMIN_EQUIPE;

  const [membre, { referentiels, assets }] = await Promise.all([
    chargerMembre(id),
    chargerReferentielsEquipe(),
  ]);
  if (!membre) notFound();

  const enLigne = membre.status === "PUBLISHED";
  const nom = membre.nom || membre.traductions.fr.nom || membre.traductions.en.nom || null;
  const fonction = membre.traductions.fr.role || membre.traductions.en.role || t.sansFonction;

  // Où la fiche se voit, déduit de son état plutôt que stocké
  // (cf. lib/equipe/statut.ts).
  const emplacements = enLigne
    ? [
        t.ouGrille,
        ...(membre.featured ? [t.ouCoordination] : []),
        ...(membre.composante ? [t.ouComposante(membre.composante)] : []),
      ]
    : [];

  /**
   * Lien vers la page publique. Il n'existe que si la fiche est en ligne ET
   * traduite en français : un lien vers une grille où elle n'apparaît pas
   * donnerait à croire qu'elle est déjà servie.
   *
   * Il pointe la page « L'Unité » plutôt que l'accueil : la grille y est la
   * section principale, non un bloc parmi douze.
   */
  const publicUrl = enLigne && membre.traductions.fr.complete ? "/fr/ugptn" : null;

  return (
    <>
      <Link href={adminPath("/equipe")} className="adm-back">← {t.retourListe}</Link>

      <div className="adm-entete" style={{ marginTop: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="adm__title">{nom || t.posteVacant}</h1>
          <div className="adm-entete__meta">
            <span className={`adm-badge adm-statut adm-statut--${enLigne ? "published" : "draft"}`}>
              {TEAM_STATUT_LABEL[membre.status]}
            </span>

            <span className="mono adm-hint">{fonction}</span>
            {emplacements.length > 0 && (
              <span className="mono adm-hint">{emplacements.join(" · ")}</span>
            )}

            {/* État de chaque langue, visible sans ouvrir les onglets : c'est
                ce qui reste à traduire, dit d'un coup d'œil. */}
            <span className="adm-langues">
              {LOCALES.map((locale) => {
                const tr = membre.traductions[locale];
                const etat = tr.complete ? t.tradPresente : t.tradManquante;
                return (
                  <span
                    key={locale}
                    className={`adm-langue${tr.complete ? " is-on" : ""}`}
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
        <MembreActions id={membre.id} enLigne={enLigne} />
      </div>

      {params.cree && <div className="adm-ok" role="status" style={{ marginTop: 16 }}>{t.creeOk}</div>}

      <div style={{ marginTop: 26 }}>
        <MembreEditeur
          membre={membre}
          referentiels={referentiels}
          assets={assets}
          apercuUrl={publicUrl}
        />
      </div>
    </>
  );
}
