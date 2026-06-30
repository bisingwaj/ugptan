import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { TransparenceClient } from "@/components/docs/TransparenceClient";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return { title: dict(asLang(params.lang)).foot.transparence };
}

export default function TransparencePage({ params }: { params: { lang: string } }) {
  const lang = asLang(params.lang);
  const t = dict(lang);
  return (
    <div>
      <section className="page-hero">
        <div className="section__inner">
          <div className="page-hero__crumb">UGPTN / {t.foot.transparence}</div>
          <h1>{t.docs.heroTitle}</h1>
          <p className="page-hero__lead">{t.docs.heroLead}</p>
        </div>
      </section>
      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <TransparenceClient lang={lang} />
        </div>
      </section>
    </div>
  );
}
