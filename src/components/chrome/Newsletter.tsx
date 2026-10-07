import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { NewsletterFormulaire } from "@/components/chrome/NewsletterFormulaire";

/**
 * Bloc d'inscription à la lettre d'information, présent au pied de chaque page
 * publique.
 *
 * Composant serveur : l'intitulé et le chapô sont du texte statique, rendu ici.
 * Seul le formulaire est un composant client, et il ne reçoit que les libellés
 * `nl` de la langue courante. Quand tout le bloc était client, il importait
 * `@/content/i18n` entier (FR + EN), qui partait dans le JavaScript commun de
 * chaque page.
 */
export function Newsletter({ lang }: { lang: Lang }) {
  const t = dict(lang).nl;
  return (
    <section className="section--dark px-(--pad-x) py-[clamp(56px,7vw,96px)]">
      <div className="cols2 cols2--center mx-auto max-w-(--maxw) gap-[clamp(28px,5vw,64px)]">
        <div>
          <div className="kicker kicker--light">{t.label}</div>
          <h2 className="h2--sm mb-3">{t.title}</h2>
          <p className="max-w-[480px] text-[15.5px] leading-[1.6] text-c-40">{t.lead}</p>
        </div>
        <NewsletterFormulaire lang={lang} t={t} />
      </div>
    </section>
  );
}
