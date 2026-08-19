"use client";

/**
 * Fiche d'une composante : le sommaire de ses sections à gauche, la section
 * ouverte à droite.
 *
 * ─── Pourquoi un sommaire et non une page par section ────────────────────────
 * Une page de composante compte neuf sections. Leur donner neuf adresses
 * ferait neuf allers-retours pour relire une page qui se lit d'une traite, et
 * perdrait la saisie en cours à chaque changement. Le sommaire reproduit
 * l'ORDRE DE LA PAGE PUBLIQUE : la rédaction descend la fiche comme le lecteur
 * descend la page, et sait sans chercher où se modifie ce qu'elle a sous les
 * yeux.
 *
 * ⚠️ Les panneaux MASQUENT, ils ne démontent pas — même règle que les onglets
 * de langue partout ailleurs dans la console. Une correction commencée dans
 * « La problématique » survit à un détour par « Les objectifs ».
 *
 * Le sommaire dit aussi ce qui est REMPLI : une pastille par section porte le
 * nombre d'entrées, ou rien quand la section est vide. C'est ce qui répond,
 * sans ouvrir, à la seule question qu'on se pose en arrivant sur une fiche —
 * qu'est-ce qui reste à écrire.
 */
import { useState } from "react";
import { ADMIN_PROJET } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { MediaRef } from "@/lib/medias";
import type { ComposanteSaisie, ReferentielsProjet } from "@/lib/projet/saisie";
import {
  CHAMPS_SECTION, COMPOSANTE_SECTIONS, COMPOSANTE_SECTION_HINT, COMPOSANTE_SECTION_LABEL,
  SECTION_BLOCS, type ComposanteSection,
} from "@/lib/projet/statut";
import { ComposanteBlocsListe } from "@/components/dashboard/projet/ComposanteBlocsListe";
import { ComposanteLangue } from "@/components/dashboard/projet/ComposanteLangue";
import {
  ReglagesIdentite, ReglagesMep, ReglagesVideo,
} from "@/components/dashboard/projet/ComposanteReglages";
import { PastilleTraduction } from "@/components/dashboard/ia/PastilleTraduction";
import { sourcePourTraduire, type EtatVue } from "@/lib/ia/statut";

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function ComposanteEditeur({
  composante,
  referentiels,
  assets,
  etatsIA,
  etatsIABlocs,
}: {
  composante: ComposanteSaisie & { id: string };
  referentiels: ReferentielsProjet;
  assets: MediaRef[];
  /** État de l'assistance pour la composante (cf. lib/ia/suivi.ts). */
  etatsIA: Partial<Record<Lang, EtatVue>>;
  /** Idem, pour chacun de ses blocs, indexé par identifiant de bloc. */
  etatsIABlocs: Map<string, Partial<Record<Lang, EtatVue>>>;
}) {
  const t = ADMIN_PROJET;
  const [section, setSection] = useState<ComposanteSection>("identite");
  const [langue, setLangue] = useState<Lang>("fr");

  /** Entrées d'un type, déjà rangées par la requête. */
  const blocsDe = (type: string) => composante.blocs.filter((bloc) => bloc.type === type);

  /** Ce qu'une section porte déjà, dit sans l'ouvrir. */
  const compte = (cle: ComposanteSection): number =>
    SECTION_BLOCS[cle].reduce((total, type) => total + blocsDe(type).length, 0);

  return (
    <div className="adm-fiche">
      <nav className="adm-fiche__sommaire" aria-label={t.sommaire}>
        <div className="label-mono adm-fiche__sommaire-titre">{t.sommaire}</div>
        <p className="adm-hint" style={{ margin: "0 0 12px" }}>{t.sommaireAide}</p>

        {COMPOSANTE_SECTIONS.map((cle, rang) => {
          const n = compte(cle);
          const listes = SECTION_BLOCS[cle].length > 0;
          return (
            <button
              key={cle}
              type="button"
              className={`adm-fiche__lien${section === cle ? " is-on" : ""}`}
              onClick={() => setSection(cle)}
              aria-current={section === cle ? "true" : undefined}
            >
              <span className="mono adm-fiche__n">{String(rang + 1).padStart(2, "0")}</span>
              <span className="adm-fiche__label">{COMPOSANTE_SECTION_LABEL[cle]}</span>
              {listes && (
                <span className={`adm-fiche__compte${n === 0 ? " is-vide" : ""}`}>{n}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="adm-fiche__panneaux">
        {COMPOSANTE_SECTIONS.map((cle) => {
          const textes = CHAMPS_SECTION[cle];
          const types = SECTION_BLOCS[cle];

          return (
            <section key={cle} className="adm-panneau" hidden={section !== cle}>
              <h2 className="adm-panneau__titre">{COMPOSANTE_SECTION_LABEL[cle]}</h2>
              <p className="adm-panneau__hint">{COMPOSANTE_SECTION_HINT[cle]}</p>

              {/* Les textes de la section, une langue à la fois. Les onglets ne
                  paraissent que si la section en demande. */}
              {textes.length > 0 && (
                <>
                  <div className="adm-tabs" role="tablist" aria-label={t.langueRedaction}>
                    {LOCALES.map((lang) => {
                      const tr = composante.traductions[lang];
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
                          <PastilleTraduction etat={etatsIA[lang]} />
                        </button>
                      );
                    })}
                  </div>

                  {LOCALES.map((lang) => (
                    <ComposanteLangue
                      key={lang}
                      composanteId={composante.id}
                      section={cle}
                      lang={lang}
                      valeurs={composante.traductions[lang]}
                      visible={langue === lang}
                      /* Retirer une langue entière n'a de sens qu'ici : c'est la
                         section qui porte l'intitulé dont dépend la publication. */
                      avecSuppression={cle === "identite"}
                      /* Seule la section AFFICHÉE porte le bandeau d'état.
                         Une composante s'édite section par section, toutes
                         rendues et masquées sauf une : le même bandeau
                         apparaîtrait autant de fois qu'il y a de sections, et
                         chacun reprendrait de son côté une traduction en
                         attente — autant d'appels payants pour un seul travail.
                         Il suit donc la section, au lieu de s'y multiplier. */
                      etatIA={cle === section ? etatsIA[lang] : undefined}
                      sourceIA={
                        cle === section
                          ? sourcePourTraduire(lang, (l) => composante.traductions[l].existe)
                          : undefined
                      }
                    />
                  ))}
                </>
              )}

              {/* Les réglages non linguistiques, quand la section en porte. */}
              {cle === "identite" && <ReglagesIdentite composante={composante} assets={assets} />}
              {cle === "mep" && <ReglagesMep composante={composante} referentiels={referentiels} />}
              {cle === "video" && <ReglagesVideo composante={composante} referentiels={referentiels} />}

              {/* Les listes d'entrées de la section. */}
              {types.map((type) => (
                <ComposanteBlocsListe
                  key={type}
                  composanteId={composante.id}
                  type={type}
                  blocs={blocsDe(type)}
                  assets={assets}
                  voisines={referentiels.composantes}
                  etatsIA={etatsIABlocs}
                />
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
