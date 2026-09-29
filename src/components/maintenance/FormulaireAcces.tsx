"use client";

/**
 * Saisie du code pendant une fermeture, et bascule de langue de l'écran.
 *
 * Les deux vivent ici pour la même raison : ils ont besoin du chemin demandé.
 * Le formulaire le renvoie à l'action, qui y ramène la personne une fois le
 * laissez-passer posé ; la bascule de langue n'échange que le préfixe, pour ne
 * pas renvoyer à l'accueil quelqu'un qui visait une page précise.
 *
 * ⚠️ Le chemin est PASSÉ en propriété, et non lu par `usePathname`. La page est
 * atteinte par réécriture du proxy : l'adresse du navigateur et celle du rendu
 * serveur diffèrent, et s'en remettre au crochet ferait diverger les deux.
 */
import { useActionState } from "react";
import Link from "next/link";
import { ouvrirAvecCodeAction, type AccesErreur, type AccesState } from "@/actions/maintenance";
import { dict } from "@/content/i18n";
import { LANGS, type Lang } from "@/lib/pick";

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

const etatInitial: AccesState = { erreur: null };

export function FormulaireAcces({ lang, chemin }: { lang: Lang; chemin: string }) {
  const t = dict(lang).maintenance;
  const [etat, action, enCours] = useActionState(ouvrirAvecCodeAction, etatInitial);

  const messages: Record<AccesErreur, string> = {
    forme: t.erreurForme,
    refus: t.erreurRefus,
    trop: t.erreurTrop,
    indispo: t.erreurIndispo,
  };
  const erreur = etat.erreur ? messages[etat.erreur] : null;

  return (
    <form action={action} className="mnt__acces">
      <input type="hidden" name="destination" value={chemin} />

      <label className="label-mono" htmlFor="mnt-code">{t.accesLabel}</label>

      <div className="mnt__saisie">
        <input
          id="mnt-code"
          name="code"
          type="text"
          className="mnt__champ mono"
          /* Clavier numérique sur mobile, sans passer par `type="number"` : ce
             dernier ajoute des flèches d'incrément qui n'ont aucun sens sur un
             code, et rogne les zéros de tête. */
          inputMode="numeric"
          autoComplete="off"
          maxLength={9}
          placeholder="000000"
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? "mnt-erreur" : undefined}
          required
        />
        <button type="submit" className="mnt__btn" disabled={enCours}>
          {enCours ? t.accesEnCours : t.accesBouton}
        </button>
      </div>

      {erreur && <p id="mnt-erreur" className="mnt__erreur" role="alert">{erreur}</p>}
    </form>
  );
}

/** Bascule FR/EN, sur le chemin demandé et non sur l'accueil. */
export function LangueMaintenance({ lang, chemin }: { lang: Lang; chemin: string }) {
  return (
    <nav className="mnt__langues" aria-label={lang === "en" ? "Language" : "Langue"}>
      {LANGS.map((autre) => {
        const cible = chemin.replace(/^\/(fr|en)(?=\/|$)/, `/${autre}`);
        return autre === lang ? (
          <span key={autre} className="mnt__langue mnt__langue--active" aria-current="true">
            {LANG_LABEL[autre]}
          </span>
        ) : (
          <Link key={autre} href={cible} className="mnt__langue">
            {LANG_LABEL[autre]}
          </Link>
        );
      })}
    </nav>
  );
}
