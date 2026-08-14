"use client";

/**
 * Corps rédigé d'une publication, dans les deux langues.
 *
 * ─── Deux éditeurs, un seul envoi ───────────────────────────────────────────
 *
 * Les deux langues partent avec le reste de la fiche, contrairement aux
 * articles où chacune a son formulaire. Ce n'est pas une simplification : c'est
 * le parti déjà retenu par ce module pour les titres et les descriptions
 * (cf. lib/docs/saisie.ts). Un article est écrit par un rédacteur puis traduit
 * par un traducteur, chacun de son côté — d'où le risque d'écrasement qui
 * impose deux envois. Une pièce documentaire est traduite par la personne qui
 * la publie, en une fois. Un envoi unique suffit, et évite de faire chercher
 * deux boutons d'enregistrement sur le même écran.
 *
 * ─── Les onglets masquent, ils ne démontent pas ─────────────────────────────
 *
 * Les deux `RichEditor` restent montés en permanence, l'un caché : chacun tient
 * son contenu dans le DOM d'un `contenteditable`, et le démonter perdrait la
 * saisie en cours au changement d'onglet. C'est la même mécanique que les
 * onglets de langue des articles.
 */
import { useState } from "react";
import { ADMIN_DOCS } from "@/content/admin";
import type { Lang } from "@/lib/pick";
import type { MediaRef } from "@/lib/medias";
import { RichEditor } from "@/components/dashboard/actus/RichEditor";

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function DocumentRedaction({
  contenuFr,
  contenuEn,
  assets,
}: {
  contenuFr: string;
  contenuEn: string;
  assets: MediaRef[];
}) {
  const t = ADMIN_DOCS;
  const [langue, setLangue] = useState<Lang>("fr");

  const corps: { lang: Lang; name: string; valeur: string; label: string; placeholder: string }[] = [
    { lang: "fr", name: "contenuFr", valeur: contenuFr, label: t.corpsFr, placeholder: t.corpsPlaceholderFr },
    { lang: "en", name: "contenuEn", valeur: contenuEn, label: t.corpsEn, placeholder: t.corpsPlaceholderEn },
  ];

  return (
    <div className="adm-panel adm-edit__bloc">
      <div className="label-mono">{t.blocCorps}</div>
      <p className="adm-hint" style={{ marginBottom: 14 }}>{t.blocCorpsAide}</p>

      <div className="adm-tabs" role="tablist" aria-label={t.blocCorps}>
        {corps.map((champ) => (
          <button
            key={champ.lang}
            type="button"
            role="tab"
            aria-selected={langue === champ.lang}
            className={`adm-tab${langue === champ.lang ? " is-on" : ""}`}
            onClick={() => setLangue(champ.lang)}
          >
            <span className="mono adm-tab__code">{champ.lang.toUpperCase()}</span>
            <span>{LANG_LABEL[champ.lang]}</span>
            <span className={`adm-tab__etat${champ.valeur.trim() ? " is-ok" : ""}`}>
              {champ.valeur.trim() ? "Rédigé" : "Vide"}
            </span>
          </button>
        ))}
      </div>

      {corps.map((champ) => (
        // `hidden` et non un démontage conditionnel : cf. l'en-tête.
        <div key={champ.lang} hidden={langue !== champ.lang} style={{ marginTop: 16 }}>
          <div className="label-mono" id={`corps-${champ.lang}`}>{champ.label}</div>
          {champ.lang === "en" && (
            <p className="adm-hint" style={{ margin: "6px 0 10px" }}>{t.corpsEnAide}</p>
          )}
          <RichEditor
            name={champ.name}
            defaultValue={champ.valeur}
            assets={assets}
            labelId={`corps-${champ.lang}`}
            placeholder={champ.placeholder}
          />
        </div>
      ))}
    </div>
  );
}
