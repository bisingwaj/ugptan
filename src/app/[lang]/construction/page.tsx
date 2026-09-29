import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";

/**
 * Contenu substitué à une page coupée individuellement depuis la console
 * (cf. lib/routes.ts — PAGES_DESACTIVABLES — et src/proxy.ts, qui réécrit vers
 * cette adresse SANS changer celle affichée au navigateur).
 *
 * DANS le segment `[lang]`, à dessein : `LangLayout` continue de rendre
 * l'en-tête et le pied de page, seul le contenu de la page change. C'est la
 * différence avec `(maintenance)/maintenance`, qui remplace l'écran entier.
 */
export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  return {
    title: dict(lang).construction.titre,
    robots: { index: false, follow: true },
  };
}

export default async function PageConstruction(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang).construction;
  const terreur = dict(lang).erreur;

  return (
    <section className="section">
      <div className="section__inner max-w-[62ch]">
        <p className="mono">{t.kicker}</p>
        <h1 className="h2 mt-3">{t.titre}</h1>
        <p className="lead mt-5">{t.corps}</p>
        <div className="stack-sm mt-8 flex flex-wrap gap-2.5">
          <Link href={`/${lang}`} className="btn btn--primary">
            {terreur.accueil}
            <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
