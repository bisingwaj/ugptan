import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { TransparenceClient } from "@/components/docs/TransparenceClient";
import { PageHero } from "@/components/ui/PageHero";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return { title: dict(asLang(params.lang)).foot.transparence };
}

export default async function TransparencePage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  return (
    <div>
      <PageHero crumb={`UGPTN / ${t.foot.transparence}`} title={t.docs.heroTitle} lead={t.docs.heroLead} />
      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <TransparenceClient lang={lang} />
        </div>
      </section>
    </div>
  );
}
