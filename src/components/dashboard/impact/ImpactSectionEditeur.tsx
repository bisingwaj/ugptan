"use client";

/**
 * Écran d'édition d'une section « Histoires & impact ».
 *
 * L'organisation reprend celle des actualités et des événements : les langues à
 * gauche sous des onglets, les réglages à droite, et autant de formulaires
 * INDÉPENDANTS que d'objets à enregistrer. Ils ne s'enregistrent pas ensemble
 * parce qu'ils n'appartiennent ni aux mêmes personnes ni au même moment : le
 * rédacteur écrit en français, le traducteur ajoute l'anglais plus tard, le
 * responsable publie.
 *
 * S'y ajoute ce que les deux autres modules n'ont pas : la LISTE DES ENTRÉES,
 * sous les onglets de l'en-tête. Une section n'existe que par ce qu'elle
 * affiche, et séparer les deux écrans obligerait à faire l'aller-retour pour
 * vérifier qu'un chiffre corrigé est bien celui de la bonne grille.
 */
import { useActionState, useState } from "react";
import Link from "next/link";
import { ajouterItemAction, type ImpactFormState } from "@/actions/admin-impact";
import { ADMIN_IMPACT } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { ReferentielsImpact, SectionSaisie } from "@/lib/impact/saisie";
import type { MediaRef } from "@/lib/medias";
import { ImpactItemCarte } from "@/components/dashboard/impact/ImpactItemCarte";
import { ImpactSectionEntete } from "@/components/dashboard/impact/ImpactSectionEntete";
import { ImpactSectionReglages } from "@/components/dashboard/impact/ImpactSectionReglages";

const etatInitial: ImpactFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

type Props = {
  section: SectionSaisie & { id: string };
  referentiels: ReferentielsImpact;
  assets: MediaRef[];
  /** Nom de la section dont les entrées sont reprises, le cas échéant. */
  sourceNom: string | null;
  /** Identifiant de cette source, pour y renvoyer d'un clic. */
  sourceId: string | null;
  apercuUrl: string | null;
};

export function ImpactSectionEditeur({
  section,
  referentiels,
  assets,
  sourceNom,
  sourceId,
  apercuUrl,
}: Props) {
  const t = ADMIN_IMPACT;
  const [langue, setLangue] = useState<Lang>("fr");
  const [etatAjout, ajouter, ajoutEnCours] = useActionState(ajouterItemAction, etatInitial);

  const reprend = Boolean(section.sourceId);

  return (
    <div className="adm-edit">
      <div className="adm-edit__main">
        <div className="adm-tabs" role="tablist" aria-label={t.langueRedaction}>
          {LOCALES.map((lang) => {
            const tr = section.traductions[lang];
            const etat = !tr.existe ? t.tradManquante : tr.complete ? t.tradPresente : t.tradIncomplete;
            return (
              <button
                key={lang}
                type="button"
                role="tab"
                aria-selected={langue === lang}
                className={`adm-tab${langue === lang ? " is-on" : ""}`}
                onClick={() => setLangue(lang)}
              >
                <span className="mono adm-tab__code">{lang.toUpperCase()}</span>
                <span>{LANG_LABEL[lang]}</span>
                <span className={`adm-tab__etat${tr.complete ? " is-ok" : tr.existe ? " is-partiel" : ""}`}>
                  {etat}
                </span>
              </button>
            );
          })}
        </div>

        {/* Les onglets masquent, ils ne démontent pas : une saisie en cours
            dans l'autre langue survit au changement d'onglet. */}
        {LOCALES.map((lang) => (
          <ImpactSectionEntete
            key={lang}
            sectionId={section.id}
            lang={lang}
            valeurs={section.traductions[lang]}
            visible={langue === lang}
          />
        ))}

        <div className="adm-items">
          <div className="adm-items__tete">
            <h2 className="adm__section-title" style={{ margin: 0 }}>{t.itemsTitle}</h2>
            {!reprend && (
              <form action={ajouter}>
                <input type="hidden" name="sectionId" value={section.id} />
                <button type="submit" className="btn btn--outline btn--sm" disabled={ajoutEnCours}>
                  {ajoutEnCours ? t.enregistrement : t.itemAjouter}
                </button>
              </form>
            )}
          </div>

          {etatAjout.error && <div className="auth-error" role="alert">{etatAjout.error}</div>}
          {etatAjout.ok && <div className="adm-ok" role="status">{etatAjout.ok}</div>}

          {reprend ? (
            <div className="adm-list">
              <div className="adm-list__row">
                {t.itemsReprise}
                {sourceNom && sourceId && (
                  <>
                    {" "}
                    <Link href={adminPath(`/stories/${sourceId}`)} className="adm-link">
                      {sourceNom} →
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : section.items.length === 0 ? (
            <div className="adm-list">
              <div className="adm-list__row">{t.itemsVide}</div>
            </div>
          ) : (
            <div className="adm-items__liste">
              {section.items.map((item, rang) => (
                <ImpactItemCarte
                  key={item.id}
                  item={item}
                  layout={section.layout}
                  assets={assets}
                  rang={rang}
                  total={section.items.length}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="adm-edit__aside">
        <ImpactSectionReglages
          section={section}
          referentiels={referentiels}
          apercuUrl={apercuUrl}
        />
      </aside>
    </div>
  );
}
