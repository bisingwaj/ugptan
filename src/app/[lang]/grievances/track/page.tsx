import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";
import { GRIEVANCE_STAGES, SLA_DAYS, STAGE_LABEL, STAGE_NEXT_STEP } from "@/lib/mgp/model";
import { PageHero } from "@/components/ui/PageHero";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { MgpTrackerUrl } from "@/components/url/MgpTrackerUrl";
import { metaPage } from "@/lib/seo";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang).mgp;
  return metaPage({
    lang,
    path: NAV.mgpSuivi,
    title: t.trackPageTitle,
    description: t.trackPageMeta,
    // Page de service, sans contenu indexable au-delà de sa notice : elle a sa
    // place dans l'index, les dossiers qu'elle affiche n'en ont aucune.
    robots: { index: true, follow: true },
  });
}

export default async function MgpSuiviPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang).mgp;

  /* Le numéro transmis par l'accusé de réception (`?ref=`) n'est PAS lu ici :
     lire `searchParams` rendrait la page dynamique à chaque visite.
     `MgpTrackerUrl` le lit dans le navigateur, sous `<Suspense>`, et lance la
     recherche dès l'hydratation (cf. components/url/useParametre.ts). */

  return (
    <div>
      <PageHero
        crumb={
          <>
            UGPTN / <Link href={route(lang, NAV.mgp)}>{dict(lang).cta.mgp}</Link> / {t.trackPageTitle}
          </>
        }
        title={t.trackPageHeroTitle}
        lead={t.trackPageLead}
      />

      <section style={{ padding: "clamp(48px,6vw,84px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <div className="cols2" style={{ gridTemplateColumns: "1.05fr .95fr", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)", alignItems: "stretch" }}>
            <MgpTracker lang={lang} initialRef={initialRef} />

            <div style={{ background: "#fff", padding: "clamp(26px,3vw,38px)" }}>
              <Kicker>{t.pipelineTitle}</Kicker>
              <h2 className="h2--sm" style={{ margin: "0 0 10px" }}>{t.generalTitle}</h2>
              <p style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.65, color: "var(--c-70)" }}>{t.generalDesc}</p>

              <RevealGroup style={{ display: "flex", flexDirection: "column", gap: 0 }} gap={0.04}>
                {GRIEVANCE_STAGES.map((stage, i) => {
                  const next = STAGE_NEXT_STEP[stage];
                  return (
                    <RevealItem key={stage} style={{ display: "flex", gap: 14, padding: "14px 0", borderTop: i === 0 ? "none" : "1px solid var(--c-20)" }}>
                      <span className="mono" style={{ width: 26, height: 26, flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, background: "var(--ac-pale)", color: "var(--ac)", border: "1px solid var(--ac-line)" }}>{i + 1}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 600 }}>{pick(STAGE_LABEL[stage], lang)}</div>
                        {next && <p style={{ margin: "4px 0 0", fontSize: 12.5, lineHeight: 1.55, color: "var(--c-60)" }}>{pick(next, lang)}</p>}
                      </div>
                    </RevealItem>
                  );
                })}
              </RevealGroup>

              <p className="mono" style={{ margin: "22px 0 0", fontSize: 11.5, lineHeight: 1.6, color: "var(--c-50)" }}>{t.slaBadge}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
                <Link href={route(lang, NAV.mgp)} className="btn btn--outline btn--sm">
                  {t.trackFileCta} <span className="arrow">→</span>
                </Link>
              </div>
            </div>
          </div>

          <Reveal style={{ marginTop: "clamp(32px,4vw,52px)", border: "1px solid var(--c-20)", borderLeft: "3px solid var(--c-80)", background: "var(--c-10)", padding: "clamp(24px,3vw,36px)" }}>
            <h2 className="h2--sm" style={{ margin: "0 0 10px", fontSize: "clamp(17px,1.9vw,21px)" }}>
              {t.refKeepTitle}
            </h2>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "var(--c-70)", maxWidth: 880 }}>{t.trackPrivacy}</p>
            <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.7, color: "var(--c-60)", maxWidth: 880 }}>{t.trackSlaNote.replace("{days}", String(SLA_DAYS))}</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
