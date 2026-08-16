import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { meta, mandat, principes, poles, gouvernance, engagement } from "@/content/data";
import { methode, engagementsList, glossaire, ugptnFaq } from "@/content/carbon";
import { membresEquipe } from "@/lib/equipe/query";
import { NAV, route } from "@/lib/routes";
import { Kicker } from "@/components/ui/Kicker";
import { Accordion } from "@/components/ui/Accordion";
import { PageHero } from "@/components/ui/PageHero";
import { FilAriane } from "@/components/ui/FilAriane";
import { CtaFin } from "@/components/ui/CtaFin";
import { GrilleEquipe } from "@/components/equipe/GrilleEquipe";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

/**
 * La page comptait quatorze blocs, dont cinq listes décrivant le même métier et
 * deux organigrammes aux intitulés différents. Elle en compte six, plus le
 * héros, la citation d'engagement et la sortie :
 *
 *   1. Mandat            ← « Mandat » + « Objectif & rôle »
 *   2. Ce qui borne      ← « Principes directeurs » + « Nos engagements »
 *   3. Organisation      ← « Organisation interne » + « Les pôles en action »
 *                          + « L'Unité en bref »
 *   4. Méthode           inchangée
 *   5. Équipe            inchangée, sans le compte écrit en dur
 *   6. Questions         ← FAQ + glossaire replié
 */
export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const u = dict(lang).ugptn;
  const path = `/${lang}${NAV.ugptn}`;
  return {
    /* `absolute` parce que le gabarit du layout ajoute « · UGPTN » : sur cette
       page-ci, il produirait « L'UGPTN · UGPTN ». */
    title: { absolute: `${u.titre} — ${meta.uniteLong}` },
    description: u.metaDesc,
    alternates: {
      canonical: path,
      languages: { fr: `/fr${NAV.ugptn}`, en: `/en${NAV.ugptn}` },
    },
    openGraph: { title: u.titre, description: u.metaDesc, url: path, type: "website" },
  };
}

export default async function UgptnPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const u = t.ugptn;
  const faq = ugptnFaq.map((f) => ({ q: pick(f.q, lang), r: pick(f.r, lang) }));
  const n2 = (i: number) => String(i + 1).padStart(2, "0");
  const equipe = await membresEquipe(lang);

  /* Les deux chiffres affichés sont dérivés des données, jamais écrits.
     Le total de sous-rôles ne l'est PAS : la table n'en liste que dix-neuf, là
     où les textes du site en annoncent vingt et un. Tant que l'écart n'est pas
     tranché, la page n'avance aucun total (cf. `polesSousRoles` dans data.ts). */
  const reperes: { v: string; l: string }[] = [
    { v: String(poles.length), l: u.orgPoles },
    { v: String(gouvernance.length), l: u.orgNiveaux },
    { v: meta.arreteDate.slice(-4), l: u.arrete },
  ];

  return (
    <div>
      <PageHero
        crumb={
          <FilAriane
            label={t.lbl.ariane}
            items={[{ label: t.nav.accueil, href: route(lang) }, { label: u.titre }]}
          />
        }
        title={u.titre}
        lead={u.lead}
      />

      {/* ===== ENGAGEMENT — la seule citation de la page =====================
          L'autre, « Quand un pays se connecte… », ouvrait la page en bandeau
          sombre alors qu'elle est déjà sur l'accueil, à un clic d'ici. */}
      <section className="section--accent" style={{ padding: "clamp(56px,7vw,104px) var(--pad-x)" }}>
        <Reveal variant="up" style={{ maxWidth: 1280, margin: "0 auto" }}>
          <p style={{ margin: 0, fontSize: "clamp(22px,3vw,38px)", lineHeight: 1.35, letterSpacing: "-0.02em", fontWeight: 300 }}>« {pick(engagement, lang)} »</p>
          <div className="mono" style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: "14px 32px", fontSize: 12.5, color: "var(--ac-line)" }}>
            <span>{u.arrete}</span><span style={{ opacity: 0.6 }}>·</span><span>{meta.arrete}</span><span style={{ opacity: 0.6 }}>·</span><span>{meta.arreteDate}</span>
          </div>
        </Reveal>
      </section>

      {/* ===== 1 · MANDAT ================================================== */}
      <section className="section">
        <div className="section__inner">
          <Reveal>
            <Kicker>{u.mandatLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 18px", maxWidth: "20ch" }}>{u.mandatTitle}</h2>
            <p className="lead" style={{ margin: "0 0 44px", maxWidth: 760 }}>{u.mandatLead}</p>
          </Reveal>
          <RevealGroup className="grid-5" gap={0.045}>
            {mandat.map((m) => (
              <RevealItem key={m.n} className="cell" style={{ padding: "28px 22px", minHeight: 230, display: "flex", flexDirection: "column" }}>
                <div className="mono" style={{ fontWeight: 600, fontSize: 28, color: "var(--ac)" }}>{m.n}</div>
                <h3 style={{ margin: "18px 0 0", fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{pick(m.titre, lang)}</h3>
                <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "var(--c-70)" }}>{pick(m.desc, lang)}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ===== 2 · CE QUI BORNE SES DÉCISIONS ==============================
          Les trois règles, puis ce qu'elles engagent. Séparées, les deux blocs
          se lisaient comme deux promesses concurrentes. */}
      <section className="section section--grey">
        <div className="section__inner">
          <Reveal>
            <Kicker>{u.principesLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 40px" }}>{u.principesTitle}</h2>
          </Reveal>
          <RevealGroup className="grid-3" gap={0.05}>
            {principes.map((p, i) => (
              <RevealItem key={i} className="cell" style={{ padding: "30px 28px" }}>
                <div className="mono" style={{ fontSize: 13, color: "var(--ac)" }}>{n2(i)}</div>
                <h3 style={{ margin: "16px 0 0", fontSize: 20, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em" }}>{pick(p.titre, lang)}</h3>
                <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--c-70)" }}>{pick(p.desc, lang)}</p>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal>
            <h3 className="unite-sub">{u.engTitle}</h3>
          </Reveal>
          <RevealGroup className="grid-4" gap={0.045}>
            {engagementsList.map((e, i) => (
              <RevealItem key={i} className="cell" style={{ padding: "26px 24px", borderTop: `3px solid ${e.color}`, display: "flex", flexDirection: "column", minHeight: 150 }}>
                <h4 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{pick(e.t, lang)}</h4>
                <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--c-70)" }}>{pick(e.d, lang)}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ===== 3 · ORGANISATION INTERNE ====================================
          Une seule table de pôles. La page en présentait deux, aux intitulés
          différents, à quatre sections d'intervalle. */}
      <section className="section">
        <div className="section__inner">
          <Reveal>
            <Kicker>{u.orgLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 14px" }}>{u.orgTitle}</h2>
            <p className="lead" style={{ margin: "0 0 40px", maxWidth: 720 }}>{u.orgLead}</p>
          </Reveal>

          <RevealGroup className="unite-reperes" gap={0.045}>
            {reperes.map((r) => (
              <RevealItem key={r.l} className="cell unite-repere">
                <div className="mono unite-repere__v">{r.v}</div>
                <div className="unite-repere__l">{r.l}</div>
              </RevealItem>
            ))}
          </RevealGroup>

          <RevealGroup className="poles" gap={0.045}>
            {poles.map((pl, i) => (
              <RevealItem key={i} className="pole-row" style={{ borderLeft: `3px solid ${pl.color}` }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{pick(pl.nom, lang)}</h3>
                  <div style={{ fontSize: 12.5, color: "var(--c-60)", marginTop: 6, lineHeight: 1.4 }}>{pick(pl.role, lang)}</div>
                  <p className="pole-row__mission">{pick(pl.mission, lang)}</p>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ac)", marginTop: 12 }}>{pl.roles.length} {t.words.roles}</div>
                </div>
                <div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {pl.roles.map((r) => <span key={r} style={{ fontSize: 12.5, color: "var(--c-80)", background: "var(--c-10)", border: "1px solid var(--c-20)", padding: "6px 11px" }}>{r}</span>)}
                  </div>
                  <div className="pole-row__dossier">
                    <span className="blink" style={{ background: pl.color }} />
                    <span><span className="mono pole-row__k">{u.orgEnCours}</span>{pick(pl.dossier, lang)}</span>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ===== 4 · MÉTHODE ================================================= */}
      <section className="section section--dark">
        <div className="section__inner">
          <Reveal>
            <Kicker light>{u.methodeLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 14px", maxWidth: "18ch" }}>{u.methodeTitle}</h2>
            <p style={{ margin: "0 0 44px", fontSize: 16, lineHeight: 1.6, color: "var(--c-40)", maxWidth: 720 }}>{u.methodeLead}</p>
          </Reveal>
          <RevealGroup className="grid-5 celled--dark" gap={0.045}>
            {methode.map((m, i) => (
              <RevealItem key={i} className="cell" style={{ padding: "28px 22px", display: "flex", flexDirection: "column", minHeight: 210 }}>
                <div className="mono" style={{ fontWeight: 600, fontSize: 13, color: "#fff", background: "var(--ac)", width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{n2(i)}</div>
                <h3 style={{ margin: "18px 0 0", fontSize: 17, fontWeight: 600, lineHeight: 1.28, color: "#fff" }}>{pick(m.t, lang)}</h3>
                {/* --c-40 et non --c-70 : sur fond noir, le gris foncé n'est pas lisible. */}
                <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "var(--c-40)" }}>{pick(m.d, lang)}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ===== 5 · ÉQUIPE =================================================
          Le titre annonçait « 21 rôles » en dur, au-dessus d'une grille qui
          vient de la base : le nombre affiché compte désormais des fiches
          publiées, ce qu'il est réellement. */}
      <section className="section">
        <div className="section__inner">
          <Reveal style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 42 }}>
            <div>
              <Kicker>{u.equipeLabel}</Kicker>
              <h2 className="h2--sm">{u.equipeTitle}</h2>
            </div>
            <div style={{ maxWidth: 360 }}>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--c-60)", margin: 0 }}>{u.equipeLead}</p>
              {equipe.length > 0 && (
                <div className="mono" style={{ marginTop: 10, fontSize: 12, color: "var(--ac)" }}>{equipe.length} {u.membres}</div>
              )}
            </div>
          </Reveal>
          <GrilleEquipe membres={equipe} variante="unite" />
        </div>
      </section>

      {/* ===== 6 · QUESTIONS + GLOSSAIRE ==================================
          Le glossaire occupait une section entière pour dix définitions d'une
          ligne. Il se déplie ici, à la suite des questions, où on le cherche. */}
      <section className="section section--grey">
        <div className="section__inner">
          <Reveal>
            <Kicker>{u.faqLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 38px" }}>{u.faqTitle}</h2>
          </Reveal>
          <Accordion items={faq} />

          {/* <details> natif : composant serveur, fonctionne sans JavaScript. */}
          <details className="glossaire">
            <summary className="glossaire__sum">{u.glossaireTitle}</summary>
            <p className="glossaire__lead">{u.glossaireLead}</p>
            <div className="glossaire__grille">
              {glossaire.map((g) => (
                <div key={g.s} className="glossaire__item">
                  <span className="mono glossaire__s">{g.s}</span>
                  <span className="glossaire__d">{pick(g.d, lang)}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </section>

      <CtaFin
        titre={u.ctaTitle}
        lead={u.ctaLead}
        liens={[
          { href: route(lang, NAV.gouvernance), label: t.nav.gouvernance },
          { href: route(lang, NAV.marches), label: t.cta.marches },
          { href: route(lang, NAV.contact), label: t.nav.contact },
        ]}
      />
    </div>
  );
}
