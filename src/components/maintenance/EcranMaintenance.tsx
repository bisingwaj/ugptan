/**
 * Écran servi à la place de TOUTE page publique pendant une fermeture.
 *
 * Il tient dans un écran et répond à quatre questions, dans l'ordre où elles se
 * posent : que se passe-t-il, jusqu'à quand, que faire en attendant, et comment
 * entrer quand on en a le droit. Le reste du site n'est pas rendu du tout, pas
 * même la barre de navigation : proposer des liens qui mènent au même écran
 * serait une fausse porte.
 *
 * L'adresse demandée est conservée (cf. lib/reglages/maintenance.ts) : le
 * formulaire y ramène après vérification du code.
 */
import { contact } from "@/content/carbon";
import { dict } from "@/content/i18n";
import { formatDateHeure } from "@/lib/format";
import type { Lang } from "@/lib/pick";
import type { EtatMaintenance } from "@/lib/reglages/maintenance";
import { BrandLogo } from "@/components/chrome/BrandLogo";
import { FormulaireAcces, LangueMaintenance } from "@/components/maintenance/FormulaireAcces";

export function EcranMaintenance({ lang, etat }: { lang: Lang; etat: EtatMaintenance }) {
  const t = dict(lang).maintenance;

  // Message de circonstance saisi en console, à défaut le texte par défaut.
  const message = (lang === "en" ? etat.messages.en : etat.messages.fr)?.trim() || t.corps;

  /* Une échéance déjà passée ne s'affiche plus : elle ferait douter de tout le
     reste de l'écran. La fermeture, elle, tient jusqu'à ce qu'on la lève. */
  const echeance = etat.jusqua && etat.jusqua.getTime() > Date.now() ? etat.jusqua : null;

  return (
    <main className="mnt">
      <div className="mnt__cadre">
        <header className="mnt__tete">
          <BrandLogo format="signature" sombre className="mnt__logo" priority />
          <LangueMaintenance lang={lang} />
        </header>

        <p className="mnt__kicker mono">{t.kicker}</p>
        <h1 className="mnt__titre">{t.titre}</h1>
        <p className="mnt__corps">{message}</p>

        {echeance && (
          <p className="mnt__echeance">
            <span className="label-mono mnt__echeance-label">{t.retour}</span>
            <time dateTime={echeance.toISOString()}>{formatDateHeure(echeance, lang)}</time>
          </p>
        )}

        <section className="mnt__bloc">
          <h2 className="label-mono">{t.recours}</h2>
          <p className="mnt__note">{t.recoursCorps}</p>
          <p className="mnt__contact mono">
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <span aria-hidden="true">·</span>
            <a href={`tel:${contact.tel.replace(/\s+/g, "")}`}>{contact.tel}</a>
          </p>
        </section>

        <section className="mnt__bloc mnt__bloc--acces">
          <h2 className="label-mono">{t.accesTitre}</h2>
          <p className="mnt__note">{t.accesAide}</p>
          <FormulaireAcces lang={lang} />
        </section>
      </div>
    </main>
  );
}
