"use client";

/**
 * Champs de l'EN-TÊTE d'une section dans une langue : libellé, titre, chapô et
 * libellé du bouton.
 *
 * Composant de champs, sans `<form>` : il sert à l'écran de création comme à
 * celui d'édition, où chaque langue porte son propre formulaire.
 *
 * Le libellé du bouton n'est pas masqué quand aucun lien n'est renseigné : il
 * appartient à la langue, le lien appartient à la fiche, et les deux ne
 * s'enregistrent pas ensemble. Le masquer ferait dépendre un champ traduit de
 * l'état d'un formulaire voisin, que le traducteur ne voit pas forcément.
 */
import { useId } from "react";
import { ADMIN_IMPACT } from "@/content/admin";
import type { TraductionSectionSaisie } from "@/lib/impact/saisie";
import type { Lang } from "@/lib/pick";

export function ImpactEnteteChamps({
  lang,
  valeurs,
}: {
  lang: Lang;
  valeurs: TraductionSectionSaisie;
}) {
  const t = ADMIN_IMPACT;
  const idBase = useId();

  return (
    <>
      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-kicker`}>{t.champKicker}</label>
        <input
          id={`${idBase}-kicker`}
          name="kicker"
          type="text"
          className="field"
          // `key` sur la langue : l'onglet reste monté, mais un changement de
          // langue de rédaction à la création doit vider ce qui appartenait à
          // l'autre langue.
          key={`${lang}-kicker`}
          defaultValue={valeurs.kicker}
          placeholder="Impact humain"
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.champKickerAide}</p>
      </div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-titre`}>{t.champTitre}</label>
        <input
          id={`${idBase}-titre`}
          name="titre"
          type="text"
          className="field"
          key={`${lang}-titre`}
          defaultValue={valeurs.titre}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.champTitreAide}</p>
      </div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-lead`}>{t.champLead}</label>
        <textarea
          id={`${idBase}-lead`}
          name="lead"
          className="field"
          rows={3}
          key={`${lang}-lead`}
          defaultValue={valeurs.lead}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.champLeadAide}</p>
      </div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-ctaLabel`}>{t.champCtaLabel}</label>
        <input
          id={`${idBase}-ctaLabel`}
          name="ctaLabel"
          type="text"
          className="field"
          key={`${lang}-cta`}
          defaultValue={valeurs.ctaLabel}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.champCtaLabelAide}</p>
      </div>
    </>
  );
}
