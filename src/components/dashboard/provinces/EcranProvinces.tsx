"use client";

/**
 * L'écran « Provinces » : les vingt-six fiches, puis les projets localisés.
 *
 * Les deux listes sur un seul écran, comme le module « Gouvernance » : la page
 * province les enchaîne, et vérifier qu'un projet cite les bonnes provinces se
 * fait en regardant les deux.
 *
 * Pas de bouton d'ajout pour les fiches : la table des provinces est figée
 * (cf. content/data.ts), et l'amorçage crée la fiche de chacune.
 *
 * Chaque liste a ses filtres, tenus côté client : les cartes masquées restent
 * montées (`hidden`), une saisie en cours survit donc à un changement de
 * filtre.
 */
import { useActionState, useId, useState } from "react";
import { ajouterProjetAction, type ProvinceFormState } from "@/actions/admin-provinces";
import { ADMIN_PROVINCES } from "@/content/admin";
import type { Lang } from "@/lib/pick";
import type { EtatVue } from "@/lib/ia/statut";
import { AVANCEMENTS, AVANCEMENT_LABEL, type AvancementProjet } from "@/lib/provinces/statut";
import type {
  ComposanteOption, FicheSaisie, ProjetSaisie, ProvinceOption,
} from "@/lib/provinces/saisie";
import { FicheCarte } from "@/components/dashboard/provinces/FicheCarte";
import { ProjetCarte } from "@/components/dashboard/provinces/ProjetCarte";

const etatInitial: ProvinceFormState = { error: null, ok: null };

type FiltreFiches = "toutes" | "prio" | "aVerifier" | "horsLigne";

/** Comparaison sans casse ni accents : « kasai » trouve « Kasaï ». */
const plier = (texte: string) => texte.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Un gouverneur est à vérifier sans date de source, ou avec une date plus
 * ancienne que `dateLimite` (AAAA-MM-JJ, comparable en chaîne).
 */
const gouverneurAVerifier = (fiche: FicheSaisie, dateLimite: string) =>
  !fiche.gouverneurDate || fiche.gouverneurDate < dateLimite;

export function EcranProvinces({
  fiches,
  projets,
  provinces,
  composantes,
  etatsIAFiches,
  etatsIAProjets,
  dateLimite,
}: {
  fiches: FicheSaisie[];
  projets: ProjetSaisie[];
  provinces: ProvinceOption[];
  composantes: ComposanteOption[];
  /** États de l'assistance, indexés par identifiant (cf. lib/ia/suivi.ts). */
  etatsIAFiches: Map<string, Partial<Record<Lang, EtatVue>>>;
  etatsIAProjets: Map<string, Partial<Record<Lang, EtatVue>>>;
  /** En deçà, la date de source du gouverneur est jugée ancienne (AAAA-MM-JJ). */
  dateLimite: string;
}) {
  const t = ADMIN_PROVINCES;
  const idBase = useId();
  const [etatProjet, ajouterProjet, projetEnCours] = useActionState(ajouterProjetAction, etatInitial);

  const [recherche, setRecherche] = useState("");
  const [filtreFiches, setFiltreFiches] = useState<FiltreFiches>("toutes");
  const [filtreProvince, setFiltreProvince] = useState("");
  const [filtreAvancement, setFiltreAvancement] = useState<AvancementProjet | "">("");

  const cherche = plier(recherche.trim());
  const ficheVisible = (fiche: FicheSaisie) => {
    if (cherche && ![fiche.nom, fiche.chefLieu, fiche.gouverneur].some((champ) => plier(champ).includes(cherche))) {
      return false;
    }
    if (filtreFiches === "prio") return fiche.prio;
    if (filtreFiches === "aVerifier") return gouverneurAVerifier(fiche, dateLimite);
    if (filtreFiches === "horsLigne") return fiche.status !== "PUBLISHED";
    return true;
  };
  const projetVisible = (projet: ProjetSaisie) => {
    if (filtreAvancement && projet.avancement !== filtreAvancement) return false;
    if (filtreProvince === "national") return projet.provinces.length === 0;
    if (filtreProvince) return projet.provinces.includes(filtreProvince);
    return true;
  };
  const fichesAffichees = fiches.filter(ficheVisible).length;
  const projetsAffiches = projets.filter(projetVisible).length;
  const aVerifier = fiches.filter((fiche) => gouverneurAVerifier(fiche, dateLimite)).length;

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{t.title}</h1>
          <p className="adm__lead">{t.lead}</p>
        </div>
      </div>

      <section className="adm-items" style={{ marginTop: 32 }}>
        <div className="adm-items__tete">
          <div style={{ minWidth: 0 }}>
            <h2 className="adm__section-title" style={{ margin: 0 }}>{t.fichesTitle}</h2>
            <p className="adm-hint" style={{ marginTop: 4 }}>{t.fichesLead}</p>
          </div>
        </div>

        {fiches.length > 0 && (
          <div className="adm-filtres" role="search" style={{ marginTop: 0, marginBottom: 14 }}>
            <label className="sr-only" htmlFor={`${idBase}-recherche`}>{t.filtreRecherche}</label>
            <input
              id={`${idBase}-recherche`}
              type="search"
              className="field"
              placeholder={t.filtreRecherchePlaceholder}
              value={recherche}
              onChange={(event) => setRecherche(event.target.value)}
            />
            <label className="sr-only" htmlFor={`${idBase}-fiches`}>{t.filtreFiches}</label>
            <select
              id={`${idBase}-fiches`}
              className="field"
              value={filtreFiches}
              onChange={(event) => setFiltreFiches(event.target.value as FiltreFiches)}
            >
              <option value="toutes">{t.filtreFichesToutes}</option>
              <option value="prio">{t.filtreFichesPrio}</option>
              <option value="aVerifier">{t.filtreFichesAVerifier} ({aVerifier})</option>
              <option value="horsLigne">{t.filtreFichesHorsLigne}</option>
            </select>
            <span className="adm-hint" aria-live="polite">{t.compte(fichesAffichees, fiches.length)}</span>
          </div>
        )}

        {fiches.length === 0 ? (
          <div className="adm-list"><div className="adm-list__row">{t.ficheVide}</div></div>
        ) : (
          <div className="adm-items__liste">
            {fiches.map((fiche) => (
              <div key={fiche.id} hidden={!ficheVisible(fiche)}>
                <FicheCarte
                  fiche={fiche}
                  aVerifier={gouverneurAVerifier(fiche, dateLimite)}
                  etatsIA={etatsIAFiches.get(fiche.id) ?? {}}
                />
              </div>
            ))}
            {fichesAffichees === 0 && <div className="adm-list"><div className="adm-list__row">{t.filtreAucun}</div></div>}
          </div>
        )}
      </section>

      <section className="adm-items" style={{ marginTop: 40 }}>
        <div className="adm-items__tete">
          <div style={{ minWidth: 0 }}>
            <h2 className="adm__section-title" style={{ margin: 0 }}>{t.projetsTitle}</h2>
            <p className="adm-hint" style={{ marginTop: 4 }}>{t.projetsLead}</p>
          </div>
          <form action={ajouterProjet}>
            <button type="submit" className="btn btn--outline btn--sm" disabled={projetEnCours}>
              {projetEnCours ? t.enregistrement : t.projetAjouter}
            </button>
          </form>
        </div>

        {etatProjet.error && <div className="auth-error" role="alert">{etatProjet.error}</div>}
        {etatProjet.ok && <div className="adm-ok" role="status">{etatProjet.ok}</div>}

        {projets.length > 0 && (
          <div className="adm-filtres" role="search" style={{ marginTop: 0, marginBottom: 14 }}>
            <label className="sr-only" htmlFor={`${idBase}-province`}>{t.filtreProvince}</label>
            <select
              id={`${idBase}-province`}
              className="field"
              value={filtreProvince}
              onChange={(event) => setFiltreProvince(event.target.value)}
            >
              <option value="">{t.filtreProvinceToutes}</option>
              <option value="national">{t.filtreProvinceNational}</option>
              {provinces.map((p) => (
                <option key={p.slug} value={p.slug}>{p.nom}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor={`${idBase}-avancement`}>{t.filtreAvancement}</label>
            <select
              id={`${idBase}-avancement`}
              className="field"
              value={filtreAvancement}
              onChange={(event) => setFiltreAvancement(event.target.value as AvancementProjet | "")}
            >
              <option value="">{t.filtreAvancementTous}</option>
              {AVANCEMENTS.map((av) => (
                <option key={av} value={av}>{AVANCEMENT_LABEL[av]}</option>
              ))}
            </select>
            <span className="adm-hint" aria-live="polite">{t.compte(projetsAffiches, projets.length)}</span>
          </div>
        )}

        {projets.length === 0 ? (
          <div className="adm-list"><div className="adm-list__row">{t.projetVide}</div></div>
        ) : (
          <div className="adm-items__liste">
            {projets.map((projet, rang) => (
              <div key={projet.id} hidden={!projetVisible(projet)}>
                <ProjetCarte
                  projet={projet}
                  rang={rang}
                  total={projets.length}
                  etatsIA={etatsIAProjets.get(projet.id) ?? {}}
                  provinces={provinces}
                  composantes={composantes}
                />
              </div>
            ))}
            {projetsAffiches === 0 && <div className="adm-list"><div className="adm-list__row">{t.filtreAucun}</div></div>}
          </div>
        )}
      </section>
    </>
  );
}
