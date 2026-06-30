import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { events } from "@/content/carbon";
import { EventsGrid } from "@/components/events/EventsGrid";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return { title: dict(asLang(params.lang)).nav.evenements };
}

export default function EvenementsPage({ params }: { params: { lang: string } }) {
  const lang = asLang(params.lang);
  const t = dict(lang);
  return (
    <div>
      <section className="page-hero">
        <div className="section__inner">
          <div className="page-hero__crumb">UGPTN / {t.home.evtLabel}</div>
          <h1>{t.home.evtTitle}</h1>
          <p className="page-hero__lead">{t.home.evtLead}</p>
        </div>
      </section>
      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <EventsGrid lang={lang} events={events} withImage />
        </div>
      </section>
    </div>
  );
}
