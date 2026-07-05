import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { events } from "@/content/carbon";
import { EventsGrid } from "@/components/events/EventsGrid";
import { PageHero } from "@/components/ui/PageHero";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return { title: dict(asLang(params.lang)).nav.evenements };
}

export default function EvenementsPage({ params }: { params: { lang: string } }) {
  const lang = asLang(params.lang);
  const t = dict(lang);
  return (
    <div>
      <PageHero crumb={`UGPTAN / ${t.home.evtLabel}`} title={t.home.evtTitle} lead={t.home.evtLead} />
      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <EventsGrid lang={lang} events={events} withImage />
        </div>
      </section>
    </div>
  );
}
