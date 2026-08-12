/* Gabarit des pages légales (confidentialité, conditions d'utilisation).
   Composant serveur : il ne connaît que la structure `LegalDoc` de legal.ts —
   aucun texte juridique n'est écrit ici. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { contact } from "@/content/carbon";
import { NAV, route } from "@/lib/routes";
import type { LegalBloc, LegalDoc } from "@/content/types";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { LegalSommaire } from "./LegalSommaire";

function Bloc({ bloc, lang }: { bloc: LegalBloc; lang: Lang }) {
  switch (bloc.k) {
    case "p":
      return <p className="legal-p">{pick(bloc.texte, lang)}</p>;
    case "puces":
      return (
        <ul className="legal-puces">
          {bloc.items.map((it, i) => (
            <li key={i}>{pick(it, lang)}</li>
          ))}
        </ul>
      );
    case "liste":
      return (
        <dl className="legal-liste">
          {bloc.items.map((it, i) => (
            <div key={i} className="legal-liste__item">
              <dt>{pick(it.t, lang)}</dt>
              <dd>{pick(it.d, lang)}</dd>
            </div>
          ))}
        </dl>
      );
    case "note":
      return <p className="legal-note">{pick(bloc.texte, lang)}</p>;
  }
}

export function LegalDocument({ doc, lang }: { doc: LegalDoc; lang: Lang }) {
  const t = dict(lang);
  const anchors = doc.sections.map((s) => ({ id: s.id, label: pick(s.titre, lang) }));
  const autre = doc.slug === "confidentialite" ? "conditions" : "confidentialite";

  return (
    <div>
      <PageHero
        crumb={`UGPTN / ${t.legal.crumb}`}
        title={pick(doc.titre, lang)}
        lead={pick(doc.chapeau, lang)}
      >
        <Reveal variant="up" delay={0.18} className="legal-meta">
          <span className="mono legal-meta__maj">
            {t.legal.maj} — {pick(doc.maj, lang)}
          </span>
          <span className="mono legal-meta__code">{t.legal.code}</span>
        </Reveal>
      </PageHero>

      <section className="legal">
        <div className="section__inner legal__inner">
          <aside className="legal__aside">
            <LegalSommaire titre={t.legal.sommaire} anchors={anchors} />
          </aside>

          <div className="legal__body">
            {doc.sections.map((s, i) => (
              <article key={s.id} id={s.id} className="legal-art">
                <div className="mono legal-art__n">[ {String(i + 1).padStart(2, "0")} ]</div>
                <h2 className="legal-art__t">{pick(s.titre, lang)}</h2>
                {s.blocs.map((b, j) => (
                  <Bloc key={j} bloc={b} lang={lang} />
                ))}
              </article>
            ))}

            <div className="legal-fin">
              <div className="mono legal-fin__label">{t.legal.voirAussi}</div>
              <Link href={route(lang, NAV[autre])} className="legal-fin__link">
                {t.nav[autre]} →
              </Link>

              <div className="legal-fin__contact">
                <div className="legal-fin__ct">{t.legal.contactTitre}</div>
                <p className="legal-fin__cl">{t.legal.contactLead}</p>
                <div className="legal-fin__actions">
                  <a href={`mailto:${contact.email}`} className="btn btn--dark btn--sm">
                    {contact.email}
                  </a>
                  <Link href={route(lang, NAV.mgp)} className="btn btn--outline btn--sm">
                    {t.cta.mgp}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
