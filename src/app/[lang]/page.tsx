import Link from "next/link";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import {
  meta, reperes, composantes, odp, intermediaires, gouvernance,
  profils, question,
} from "@/content/data";
import { derniersArticles } from "@/lib/actus/query";
import { prochainsEvenements } from "@/lib/events/query";
import { membresEquipe } from "@/lib/equipe/query";
import { galleryProvinces, partners } from "@/content/carbon";
import { media } from "@/content/media";
import { NAV, route, compRoute } from "@/lib/routes";
import { compVar } from "@/lib/comp";
import { Kicker } from "@/components/ui/Kicker";
import { Counter } from "@/components/ui/Counter";
import { Photo } from "@/components/ui/Photo";
import { HeroVideo } from "@/components/home/HeroVideo";
import { ProvinceMap } from "@/components/home/ProvinceMap";
import { SectionsImpact } from "@/components/impact/SectionsImpact";
import { GrilleEquipe } from "@/components/equipe/GrilleEquipe";
import { EventsGrid } from "@/components/events/EventsGrid";
import { VideoButton } from "@/components/video/VideoButton";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { cheminArticle } from "@/components/actus/ActuCard";

/** Cache aligné sur les pages « Actualités » et « Événements » : l'accueil
 *  affiche les derniers communiqués et les prochaines rencontres, invalidés par
 *  les écritures de la console (cf. lib/actus/cache.ts, lib/events/cache.ts). */
export const revalidate = 120;

export default async function Home(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  // Deux lectures indépendantes, menées de front : aucune ne conditionne
  // l'autre, et les enchaîner ajouterait un aller-retour à la base pour rien.
  const [actualites, upcoming, equipe] = await Promise.all([
    derniersArticles(lang, 4),
    prochainsEvenements(lang, 3),
    membresEquipe(lang),
  ]);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section data-hero style={{ position: "relative", borderBottom: "1px solid #1f2430", overflow: "hidden", background: "#0b0f1a", color: "#fff", minHeight: "calc(100svh - 64px)", display: "flex", flexDirection: "column" }}>
        <HeroVideo src={media.heroFilm} poster={media.img.hero} />
        <div className="hero-grid" style={{ position: "relative", flex: 1, width: "100%", maxWidth: "var(--maxw)", margin: "0 auto", padding: "clamp(40px,6vw,88px) var(--pad-x) 0", display: "grid", gridTemplateColumns: "1.35fr .9fr", gap: "clamp(32px,5vw,72px)", alignItems: "end", alignContent: "end" }}>
          <div style={{ paddingBottom: "clamp(48px,7vw,96px)" }}>
            <Reveal variant="fade"><Kicker light>{t.home.heroKicker}</Kicker></Reveal>
            <Reveal variant="mask"><h1 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(32px,6.2vw,82px)", lineHeight: 1.04, letterSpacing: "-0.03em", color: "#fff" }}>{t.home.heroTitle}</h1></Reveal>
            <Reveal variant="up" delay={0.1}><p style={{ margin: "28px 0 0", maxWidth: 560, fontSize: "clamp(16px,1.5vw,19px)", lineHeight: 1.6, color: "#c6c6c6" }}>{t.home.heroLead}</p></Reveal>
            <Reveal variant="up" delay={0.18} className="stack-sm" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 38 }}>
              <Link href={route(lang, NAV.projet)} className="btn btn--primary">{t.cta.discover}<span className="arrow">→</span></Link>
              <VideoButton id={media.heroFilm} className="btn backdrop-blur-[4px] max-[760px]:backdrop-blur-none" style={{ paddingLeft: 15, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.28)", color: "#fff" }} dataSlot="Film du projet (lecture avec son)" dataRatio="16:9">
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--ac)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, paddingLeft: 1 }}>▶</span>
                {t.video.watch}
              </VideoButton>
            </Reveal>
            <div className="hero-links" style={{ display: "flex", flexWrap: "wrap", marginTop: 40, borderTop: "1px solid rgba(255,255,255,.14)" }}>
              {[[t.cta.docs, NAV.transparence], [t.cta.marches, NAV.marches], [t.cta.mgp, NAV.mgp]].map(([label, slug], i) => (
                <Link key={i} href={route(lang, slug as string)} className="mono" style={{ display: "flex", alignItems: "center", gap: 9, padding: i === 0 ? "14px 22px 0 0" : "14px 22px 0", fontSize: 12.5, letterSpacing: "0.04em", color: "#c6c6c6", borderLeft: i ? "1px solid rgba(255,255,255,.14)" : "none" }}>
                  <span style={{ color: "var(--ac-light)" }}>↳</span>{label as string}
                </Link>
              ))}
            </div>
          </div>
          <div className="hero-figures backdrop-blur-[8px] max-[760px]:backdrop-blur-none" style={{ border: "1px solid rgba(255,255,255,.14)", background: "rgba(13,17,26,.55)", marginBottom: "clamp(48px,7vw,96px)", color: "#fff" }}>
            <div className="mono" style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,.12)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a8a8", display: "flex", justifyContent: "space-between" }}>
              <span>{t.sec.chiffres}</span><span style={{ color: "var(--ac-light)" }}>{meta.code}</span>
            </div>
            {reperes.map((r) => (
              <div key={r.label.fr} style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "#e0e0e0", lineHeight: 1.3 }}>{pick(r.label, lang)}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: "#8d8d8d", marginTop: 3, lineHeight: 1.35 }}>{pick(r.sub, lang)}</div>
                </div>
                <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <span className="stat__num" style={{ fontSize: /^\d+$/.test(r.v) ? "clamp(24px,2.4vw,32px)" : 15, color: "#fff", letterSpacing: /^\d+$/.test(r.v) ? "-0.02em" : "0.04em" }}>{r.v}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="backdrop-blur-[4px] max-[760px]:backdrop-blur-none" style={{ position: "relative", borderTop: "1px solid #1f2430", background: "rgba(11,15,26,.6)", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#a8a8a8", overflow: "hidden" }}>
          <div className="hero-status" style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "11px var(--pad-x)", display: "flex", flexWrap: "wrap", gap: "8px 28px" }}>
            <span><span style={{ color: "var(--ac-light)" }}>●</span> {t.home.statusEffective}</span>
            <span><span style={{ color: "var(--ac-light)" }}>●</span> {t.home.statusCompletion}</span>
            <span><span style={{ color: "var(--ac-light)" }}>●</span> {meta.approche}</span>
          </div>
        </div>
      </section>

      {/* ===== INTRO / QUESTION ===== */}
      <section className="section">
        <div className="section__inner cols2" style={{ gridTemplateColumns: ".42fr 1fr", gap: "clamp(28px,5vw,72px)" }}>
          <div className="mono" style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ac)" }}>[ 01 · {t.home.introKicker} ]</div>
          <Reveal>
            <p style={{ margin: 0, fontSize: "clamp(22px,2.7vw,34px)", lineHeight: 1.4, letterSpacing: "-0.01em", fontWeight: 300 }}>{t.home.introLead}</p>
            <Reveal variant="up" delay={0.1} style={{ marginTop: 36, padding: "28px 30px", borderLeft: "3px solid var(--ac)", background: "var(--c-10)" }}>
              <p style={{ margin: 0, fontSize: "clamp(17px,1.8vw,21px)", lineHeight: 1.5, color: "var(--c-80)", fontStyle: "italic" }}>« {pick(question, lang)} »</p>
            </Reveal>
          </Reveal>
        </div>
      </section>

      {/* ===== COMPOSANTES ===== */}
      <section className="section">
        <div className="section__inner">
          <Reveal style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 48 }}>
            <div>
              <Kicker n="02">{t.sec.composantes}</Kicker>
              <h2 className="h2">{t.comp.indexTitle}</h2>
            </div>
            <p className="mono" style={{ fontSize: 12, color: "var(--c-60)", textAlign: "right", maxWidth: 260, lineHeight: 1.6, margin: 0 }}>{t.comp.rowsNote}</p>
          </Reveal>
          <RevealGroup style={{ borderTop: "1px solid var(--c-black)" }} gap={0.05}>
            {composantes.map((comp) => (
              <RevealItem key={comp.code}>
                <Link href={compRoute(lang, comp.code)} className="comp-row comp-row--link" style={{ ...compVar(comp.code), borderBottom: "1px solid var(--c-20)", display: "grid", gridTemplateColumns: "88px 1.15fr 1fr 34px", gap: "clamp(14px,2vw,32px)", padding: "26px 0", alignItems: "start" }}>
                  <div className="mono" style={{ fontWeight: 600, fontSize: 22, color: "var(--comp)" }}>{comp.code}</div>
                  <div>
                    <h3 className="comp-row__titre" style={{ margin: 0, fontSize: "clamp(18px,1.9vw,23px)", fontWeight: 600, letterSpacing: "-0.01em" }}>{pick(comp.titre, lang)}</h3>
                    <p style={{ margin: "9px 0 0", fontSize: 14.5, lineHeight: 1.55, color: "var(--c-70)", maxWidth: 440 }}>{pick(comp.desc, lang)}</p>
                  </div>
                  <div>
                    {comp.sous.map((s) => (
                      <div key={s.ref} style={{ display: "flex", gap: 10, padding: "6px 0", fontSize: 13, color: "var(--c-80)", borderBottom: "1px dotted var(--c-20)" }}>
                        <span className="mono" style={{ color: "var(--comp)", flex: "0 0 28px" }}>{s.ref}</span>
                        <span style={{ flex: 1 }}>{pick(s.text, lang)}</span>
                      </div>
                    ))}
                  </div>
                  <span className="comp-row__go" aria-hidden>→</span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
          <div style={{ marginTop: 22, textAlign: "right" }}>
            <Link href={route(lang, NAV.composantes)} className="mono" style={{ fontSize: 13, color: "var(--ac)", display: "inline-flex", alignItems: "center", gap: 8 }}>{t.comp.seeAll} →</Link>
          </div>
        </div>
      </section>

      {/* ===== RÉSULTATS / ODP ===== */}
      <section className="section section--dark">
        <div className="section__inner">
          <Reveal>
            <Kicker light n="03">{t.sec.resultats}</Kicker>
            <h2 className="h2" style={{ margin: "0 0 50px", maxWidth: 700 }}>{t.home.resultatsTitle}</h2>
          </Reveal>
          <RevealGroup className="grid-4 celled--dark" gap={0.05}>
            {odp.map((o) => (
              <RevealItem key={o.code} className="cell" style={{ display: "flex", flexDirection: "column", minHeight: 230 }}>
                <div className="mono" style={{ fontSize: 12, color: "var(--ac-light)", letterSpacing: "0.08em" }}>{o.code}</div>
                <div style={{ marginTop: "auto" }}>
                  <div className="stat__num" style={{ fontSize: "clamp(34px,4.4vw,56px)" }}><span className="stat__approx">{t.lbl.approx}</span><Counter to={o.value} dur={1300} /><span style={{ fontSize: 16, color: "var(--c-40)", marginLeft: 7, letterSpacing: 0 }}>{o.unit}</span></div>
                </div>
                <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.45, color: "var(--c-20)" }}>{pick(o.label, lang)}</div>
                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--c-50)", border: "1px solid var(--c-80)", padding: "3px 7px" }}>{t.lbl.baseline}: {o.baseline}</span>
                  {o.femmes && <span className="mono" style={{ fontSize: 10.5, color: "var(--ac-light)", border: "1px solid var(--acd)", padding: "3px 7px" }}>{o.femmes}</span>}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <RevealGroup gap={0.05} style={{ marginTop: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 1, background: "var(--c-80)", border: "1px solid var(--c-80)", borderTop: "none" }}>
            {intermediaires.map((x, i) => (
              <RevealItem key={i} style={{ background: "var(--c-black)", padding: "20px 22px" }}>
                <div className="mono" style={{ fontWeight: 600, fontSize: 24 }}><span className="stat__approx">{t.lbl.approx}</span>{x.value}<span style={{ fontSize: 13, color: "var(--ac-light)", marginLeft: 4 }}>{x.unit}</span></div>
                <div style={{ fontSize: 12.5, color: "var(--c-40)", marginTop: 7, lineHeight: 1.45 }}>{pick(x.text, lang)}</div>
              </RevealItem>
            ))}
          </RevealGroup>
          <p className="stat__note stat__note--dark">{t.lbl.indicatif}</p>
        </div>
      </section>

      {/* ===== IMPACT HUMAIN =====
          Bloc administré depuis la console (module « Histoires & impact »).
          Le dessin — grille à filets, grands chiffres, unité en accent — vit
          dans components/impact/blocs/BlocStats.tsx. */}
      <SectionsImpact emplacement="ACCUEIL_IMPACT" lang={lang} />

      {/* ===== COUVERTURE / CARTE ===== */}
      <section className="section">
        <div className="section__inner cols2 cols2--center" style={{ gridTemplateColumns: ".85fr 1.15fr" }}>
          <Reveal>
            <Kicker n="04">{t.sec.couverture}</Kicker>
            <h2 className="h2">26 provinces.<br />10 {t.words.prio}.</h2>
            <p style={{ margin: "22px 0 0", fontSize: 16, lineHeight: 1.6, color: "var(--c-70)", maxWidth: 420 }}>{t.home.couvertureLead}</p>
            <div style={{ display: "flex", gap: 26, marginTop: 34 }}>
              <div><div className="stat__num" style={{ fontSize: 40 }}><Counter to={26} /></div><div style={{ fontSize: 12.5, color: "var(--c-60)", marginTop: 4 }}>{t.words.provinces}</div></div>
              <div style={{ borderLeft: "1px solid var(--c-20)", paddingLeft: 26 }}><div className="stat__num" style={{ fontSize: 40, color: "var(--ac)" }}><Counter to={10} /></div><div style={{ fontSize: 12.5, color: "var(--c-60)", marginTop: 4 }}>{t.lbl.prio}</div></div>
            </div>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 9, fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 11, height: 11, background: "var(--ac)" }} /><span style={{ color: "var(--c-80)" }}>{t.lbl.prio} (CPF)</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 11, height: 11, border: "1px solid var(--c-50)", background: "#fff" }} /><span style={{ color: "var(--c-80)" }}>{t.lbl.autres}</span></div>
            </div>
          </Reveal>
          <Reveal variant="fade" delay={0.1}><ProvinceMap lang={lang} /></Reveal>
        </div>
      </section>

      {/* ===== GOUVERNANCE ===== */}
      <section className="section section--grey">
        <div className="section__inner">
          <Reveal>
            <Kicker n="05">{t.sec.gouvernance}</Kicker>
            <h2 className="h2" style={{ margin: "0 0 48px" }}>COPIL · CTP · UGPTN</h2>
          </Reveal>
          <RevealGroup className="grid-3" gap={0.05}>
            {gouvernance.map((g) => (
              <RevealItem key={g.sigle} className="cell" style={{ padding: "30px 28px", display: "flex", flexDirection: "column", minHeight: 300 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: 26, letterSpacing: "0.01em" }}>{g.sigle}</span>
                  <span className="mono" style={{ fontSize: 11, color: "#fff", background: "var(--ac)", padding: "3px 9px" }}>{g.effectif}</span>
                </div>
                <div style={{ fontSize: 14.5, color: "var(--c-70)", marginTop: 8, lineHeight: 1.4 }}>{pick(g.nom, lang)}</div>
                <div style={{ marginTop: 24, borderTop: "1px solid var(--c-20)", paddingTop: 18, display: "flex", flexDirection: "column", gap: 13 }}>
                  {[[t.gouv.bodyLabels.nature, pick(g.nature, lang)], [t.gouv.bodyLabels.presidence, pick(g.presidence, lang)], [t.gouv.bodyLabels.frequence, pick(g.frequence, lang)]].map(([k, v], i) => (
                    <div key={i}><div className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--c-50)" }}>{k}</div><div style={{ fontSize: 14, marginTop: 3 }}>{v}</div></div>
                  ))}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <div style={{ marginTop: 18, textAlign: "right" }}>
            <Link href={route(lang, NAV.gouvernance)} className="mono" style={{ fontSize: 13, color: "var(--ac)", display: "inline-flex", alignItems: "center", gap: 8 }}>{t.cta.more} →</Link>
          </div>
        </div>
      </section>

      {/* ===== ÉQUIPE ===== */}
      <section className="section">
        <div className="section__inner">
          <Reveal style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 46 }}>
            <div><Kicker n="06">{t.sec.equipe}</Kicker><h2 className="h2">21 {t.words.roles} · 5 {t.words.poles}</h2></div>
            <p style={{ maxWidth: 340, fontSize: 14.5, lineHeight: 1.55, color: "var(--c-60)", margin: 0 }}>{t.home.equipeLead}</p>
          </Reveal>
          {/* Grille administrée depuis la console (cf. src/lib/equipe/query.ts).
              Le même bloc sert la page « L'Unité », à l'habillage près. */}
          <GrilleEquipe membres={equipe} variante="accueil" />
        </div>
      </section>

      {/* ===== ACTUALITÉS ===== */}
      <section className="section">
        <div className="section__inner">
          <Reveal><Kicker n="07">{t.sec.actus}</Kicker></Reveal>
          <RevealGroup gap={0.045} style={{ borderTop: "1px solid var(--c-black)" }}>
            {actualites.map((a) => (
              <RevealItem key={a.id}>
                <Link href={cheminArticle(lang, a.slug)} className="actu-row" style={{ display: "grid", gridTemplateColumns: "130px 150px 1fr 40px", gap: "clamp(12px,2vw,28px)", padding: "24px 0", borderBottom: "1px solid var(--c-20)", alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: 13, color: "var(--c-60)" }}>{a.dateLabel}</span>
                  <span className="mono" style={{ fontSize: 11, color: a.categorie?.color ?? "var(--ac)", border: `1px solid ${a.categorie?.color ?? "var(--ac)"}`, padding: "4px 9px", justifySelf: "start", textTransform: "uppercase", letterSpacing: "0.05em" }}>{a.categorie?.nom ?? t.sec.actus}</span>
                  <span style={{ fontSize: "clamp(15px,1.7vw,19px)", lineHeight: 1.4 }}>{a.title}</span>
                  <span className="mono" style={{ color: "var(--ac)", textAlign: "right" }}>→</span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ===== HISTOIRES (teaser) =====
          Même section administrée que la page « Résultats » : elle en REPREND
          les entrées plutôt que d'en tenir une seconde copie, de sorte qu'une
          citation corrigée le soit aux deux endroits. */}
      <SectionsImpact emplacement="ACCUEIL_HISTOIRES" lang={lang} />

      {/* ===== ÉVÉNEMENTS (teaser) =====
          Masqué quand aucune date n'est arrêtée : un bloc « échanger,
          participer, contribuer » suivi d'une grille vide inviterait à une
          rencontre qui n'existe pas. La page « Événements » reste, elle,
          accessible par la navigation, et y explique l'attente. */}
      {upcoming.length > 0 && (
        <section className="section section--sm section--grey">
          <div className="section__inner">
            <Reveal style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 36 }}>
              <div style={{ maxWidth: 620 }}><Kicker>{t.home.evtLabel}</Kicker><h2 className="h2--sm" style={{ marginBottom: 12 }}>{t.home.evtTitle}</h2><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "var(--c-70)" }}>{t.home.evtLead}</p></div>
              <Link href={route(lang, NAV.evenements)} className="btn btn--outline" style={{ whiteSpace: "nowrap" }}>{t.home.evtUpcoming} →</Link>
            </Reveal>
            <EventsGrid lang={lang} events={upcoming} />
          </div>
        </section>
      )}

      {/* ===== GALERIE PAR PROVINCE ===== */}
      <section className="section section--sm section--grey">
        <div className="section__inner">
          <Reveal>
            <Kicker>{t.home.galleryLabel}</Kicker>
            <h2 className="h2--sm" style={{ marginBottom: 14 }}>{t.home.galleryTitle}</h2>
            <p style={{ margin: "0 0 40px", fontSize: 15.5, lineHeight: 1.6, color: "var(--c-70)", maxWidth: 680 }}>{t.home.galleryLead}</p>
          </Reveal>
          <RevealGroup gap={0.05} className="celled-flow" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(216px,1fr))" }}>
            {galleryProvinces.map((g) => (
              <RevealItem key={g.nom} className="duo" style={{ aspectRatio: "4/3" }}>
                <Photo src={media.img[g.img]} alt={g.nom} />
                <div style={{ position: "absolute", left: 14, right: 14, bottom: 13, fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.25 }}>{g.nom}</div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ===== PARTENAIRES ===== */}
      <section className="section section--sm">
        <div className="section__inner">
          <Reveal style={{ marginBottom: 40, maxWidth: 640 }}><Kicker>{t.home.partenairesLabel}</Kicker><h2 className="h2--sm" style={{ marginBottom: 14 }}>{t.home.partenairesTitle}</h2><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "var(--c-70)" }}>{t.home.partenairesLead}</p></Reveal>
          <RevealGroup gap={0.04} className="logos-grid">
            {partners.map((p) => (
              <RevealItem key={p.name} className="logo-cell">
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt={p.name} loading="lazy" decoding="async" />
                ) : (
                  <div style={{ fontSize: 13.5, fontWeight: 600, textAlign: "center", lineHeight: 1.25 }}>{p.name}</div>
                )}
                <div className="logo-cell__kind">{pick(p.kind, lang)}</div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ===== PLATEFORME / 8 PROFILS ===== */}
      <section className="section section--pale">
        <div className="section__inner">
          <Reveal className="cols2" style={{ alignItems: "end", marginBottom: 46 }}>
            <div><Kicker n="08">{t.sec.plateforme}</Kicker><h2 className="h2--sm">{t.home.plateformeTitle}</h2></div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--c-80)", margin: 0, maxWidth: 460 }}>{t.home.plateformeLead}</p>
          </Reveal>
          <RevealGroup className="grid-4" gap={0.045} style={{ background: "var(--ac-line)", borderColor: "var(--ac-line)" }}>
            {profils.map((p, i) => (
              <RevealItem key={i} style={{ background: "#fff", padding: "22px 20px", minHeight: 128, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--ac)" }}>{String(i + 1).padStart(2, "0")}</div>
                <div><div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.3 }}>{pick(p.label, lang)}</div><div style={{ fontSize: 12, color: "var(--c-60)", marginTop: 6 }}>→ {pick(p.page, lang)}</div></div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </div>
  );
}
