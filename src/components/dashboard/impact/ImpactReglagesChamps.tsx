"use client";

/**
 * Champs de la FICHE d'une section : emplacement, gabarit, apparence, bouton,
 * reprise d'entrées.
 *
 * Composant de champs, sans `<form>` : il sert à l'écran de création, où il
 * voisine avec une langue dans un envoi unique, et à l'écran d'édition, où il
 * constitue son propre formulaire (cf. actions/admin-impact.ts).
 *
 * Deux réglages pilotent l'écran plutôt que de se contenter d'être enregistrés :
 *
 *   · le GABARIT annonce, sous le sélecteur, ce que la grille dessinera. Le
 *     changer sur une section qui a déjà des entrées change aussi les champs
 *     que celles-ci demandent, d'où l'avertissement ;
 *   · la REPRISE d'une autre section masque le nombre maximal d'entrées quand
 *     aucune source n'est choisie : limiter des entrées propres reviendrait à
 *     en cacher que la rédaction croit affichées.
 */
import { useId, useState } from "react";
import { ADMIN_IMPACT } from "@/content/admin";
import {
  IMPACT_EMPLACEMENT_HINT, IMPACT_EMPLACEMENT_LABEL,
  IMPACT_LAYOUTS, IMPACT_LAYOUT_HINT, IMPACT_LAYOUT_LABEL,
  IMPACT_PAGE_LABEL, IMPACT_STATUSES, IMPACT_STATUT_HINT, IMPACT_STATUT_LABEL,
  IMPACT_THEMES, IMPACT_THEME_LABEL,
  type ImpactEmplacement, type ImpactLayout, type ImpactStatut,
} from "@/lib/impact/statut";
import type { ReferentielsImpact, SectionSaisie } from "@/lib/impact/saisie";

type Props = {
  section: SectionSaisie;
  referentiels: ReferentielsImpact;
  /**
   * Emplacements que CE module administre.
   *
   * La liste n'est pas celle de tous les emplacements du site : proposer à la
   * rédaction de la page du Projet de déplacer une section vers l'accueil lui
   * offrirait de la sortir de sa propre portée, et l'action le refuserait.
   */
  emplacements: readonly ImpactEmplacement[];
  /** Création : la reprise d'entrées ne s'offre qu'une fois la section créée. */
  creation?: boolean;
};

export function ImpactReglagesChamps({ section, referentiels, emplacements, creation = false }: Props) {
  const t = ADMIN_IMPACT;
  const idBase = useId();

  const [statut, setStatut] = useState<ImpactStatut>(section.status);
  const [layout, setLayout] = useState<ImpactLayout>(section.layout);
  const [emplacement, setEmplacement] = useState<ImpactEmplacement>(section.emplacement);
  const [sourceId, setSourceId] = useState(section.sourceId);

  /**
   * ⚠️ Le serveur fait foi sur l'ÉTAT, parce qu'il n'appartient pas qu'à ce
   * formulaire : le bouton « Publier » de l'en-tête l'écrit aussi, depuis la
   * même page. Sans ce recalage, publier depuis l'en-tête puis enregistrer les
   * réglages ferait retomber la section en brouillon, sans que rien ne le dise.
   *
   * Recalage PENDANT le rendu, et non dans un `useEffect` : React ré-exécute
   * aussitôt avec la bonne valeur, sans afficher l'état périmé le temps d'une
   * frame. C'est le motif documenté pour un état dérivé d'une prop.
   */
  const [statutServeur, setStatutServeur] = useState<ImpactStatut>(section.status);
  if (statutServeur !== section.status) {
    setStatutServeur(section.status);
    setStatut(section.status);
  }

  const aDesEntrees = section.items.length > 0;

  return (
    <>
      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocPublication}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-status`}>{t.champStatut}</label>
          <select
            id={`${idBase}-status`}
            name="status"
            className="field"
            value={statut}
            onChange={(event) => setStatut(event.target.value as ImpactStatut)}
          >
            {IMPACT_STATUSES.map((valeur) => (
              <option key={valeur} value={valeur}>{IMPACT_STATUT_LABEL[valeur]}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 8 }}>{IMPACT_STATUT_HINT[statut]}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-emplacement`}>{t.champEmplacement}</label>
          <select
            id={`${idBase}-emplacement`}
            name="emplacement"
            className="field"
            value={emplacement}
            onChange={(event) => setEmplacement(event.target.value as ImpactEmplacement)}
          >
            {emplacements.map((valeur) => (
              <option key={valeur} value={valeur}>
                {IMPACT_PAGE_LABEL[valeur]} · {IMPACT_EMPLACEMENT_LABEL[valeur].split(" · ")[1]}
              </option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 8 }}>{IMPACT_EMPLACEMENT_HINT[emplacement]}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-position`}>{t.champPosition}</label>
          <input
            id={`${idBase}-position`}
            name="position"
            type="number"
            className="field"
            style={{ maxWidth: 120 }}
            defaultValue={section.position}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champPositionAide}</p>
        </div>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.champGabarit}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-layout`}>{t.champGabarit}</label>
          <select
            id={`${idBase}-layout`}
            name="layout"
            className="field"
            value={layout}
            onChange={(event) => setLayout(event.target.value as ImpactLayout)}
          >
            {IMPACT_LAYOUTS.map((valeur) => (
              <option key={valeur} value={valeur}>{IMPACT_LAYOUT_LABEL[valeur]}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 8 }}>{IMPACT_LAYOUT_HINT[layout]}</p>

          {/* Le gabarit décide des champs demandés par chaque entrée : le
              changer sur une section déjà remplie laisse des textes saisis
              pour des champs que le nouveau dessin n'affiche plus. */}
          {aDesEntrees && layout !== section.layout && (
            <p className="adm-hint" style={{ marginTop: 8, color: "var(--red)" }}>
              Ce changement modifie les champs demandés par les {section.items.length} entrées déjà saisies.
              Les textes ne sont pas perdus, mais certains cesseront d'être affichés.
            </p>
          )}
        </div>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocApparence}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-theme`}>{t.champTheme}</label>
          <select id={`${idBase}-theme`} name="theme" className="field" defaultValue={section.theme}>
            {IMPACT_THEMES.map((valeur) => (
              <option key={valeur} value={valeur}>{IMPACT_THEME_LABEL[valeur]}</option>
            ))}
          </select>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-numero`}>{t.champNumero}</label>
          <input
            id={`${idBase}-numero`}
            name="numero"
            type="text"
            className="field mono"
            style={{ maxWidth: 120 }}
            placeholder="03"
            defaultValue={section.numero}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champNumeroAide}</p>
        </div>

        <label className="adm-check">
          <input type="checkbox" name="compact" defaultChecked={section.compact} />
          <span>{t.champCompact}</span>
        </label>
        <p className="adm-hint">{t.champCompactAide}</p>

        <label className="adm-check">
          <input type="checkbox" name="grandTitre" defaultChecked={section.grandTitre} />
          <span>{t.champGrandTitre}</span>
        </label>
        <p className="adm-hint">{t.champGrandTitreAide}</p>

        <label className="adm-check">
          <input type="checkbox" name="enchaine" defaultChecked={section.enchaine} />
          <span>{t.champEnchaine}</span>
        </label>
        <p className="adm-hint">{t.champEnchaineAide}</p>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocLien}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-ctaUrl`}>{t.champCtaUrl}</label>
          <input
            id={`${idBase}-ctaUrl`}
            name="ctaUrl"
            type="text"
            className="field"
            placeholder="/project"
            defaultValue={section.ctaUrl}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champCtaUrlAide}</p>
        </div>
      </div>

      {/* La reprise ne s'offre qu'en modification : à la création, la section
          n'a pas encore d'identité à exclure de la liste des sources, et son
          gabarit n'est pas arrêté. */}
      {!creation && (
        <div className="adm-panel adm-edit__bloc">
          <div className="label-mono">{t.blocReprise}</div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-sourceId`}>{t.champSource}</label>
            <select
              id={`${idBase}-sourceId`}
              name="sourceId"
              className="field"
              value={sourceId}
              onChange={(event) => setSourceId(event.target.value)}
            >
              <option value="">{t.sansSource}</option>
              {referentiels.sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.nom} · {source.layout} ({source.items})
                </option>
              ))}
            </select>
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champSourceAide}</p>
          </div>

          {/* Le champ reste MONTÉ quand la source change : masqué, il conserve
              sa saisie, et revenir sur la reprise ne fait pas perdre la limite
              déjà entrée. */}
          <div className="adm-form__field" hidden={!sourceId}>
            <label className="label-mono" htmlFor={`${idBase}-limite`}>{t.champLimite}</label>
            <input
              id={`${idBase}-limite`}
              name="limite"
              type="number"
              min={0}
              className="field"
              style={{ maxWidth: 120 }}
              defaultValue={section.limite}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champLimiteAide}</p>
          </div>
        </div>
      )}
    </>
  );
}
