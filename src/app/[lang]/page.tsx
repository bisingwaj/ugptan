import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import {
  meta, reperes, poles,
  question,
} from "@/content/data";
import { derniersArticles } from "@/lib/actus/query";
import { composantesPubliques } from "@/lib/projet/query";
import { organesPublies } from "@/lib/gouvernance/query";
import { prochainsEvenements } from "@/lib/events/query";
import { membresEquipe } from "@/lib/equipe/query";
import { galleryProvinces, partners } from "@/content/carbon";
import { media } from "@/content/media";
import { NAV, route } from "@/lib/routes";
import { grillePleine } from "@/lib/grille";
import { SITE_URL } from "@/lib/site";
import { Kicker } from "@/components/ui/Kicker";
import { Photo } from "@/components/ui/Photo";
import { HeroVideo } from "@/components/home/HeroVideo";
import { ProvinceMap } from "@/components/home/ProvinceMap";
import { SectionsImpact } from "@/components/impact/SectionsImpact";
import { GrilleEquipe } from "@/components/equipe/GrilleEquipe";
import { CarteOrgane } from "@/components/equipe/CarteOrgane";
import { CompRow } from "@/components/composantes/CompRow";
import { GrilleODP } from "@/components/resultats/GrilleODP";
import { EventsGrid } from "@/components/events/EventsGrid";
import { VideoButton } from "@/components/video/VideoButton";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { Compteur } from "@/components/motion/Compteur";
import { cheminArticle } from "@/components/actus/ActuCard";
import { metaPage } from "@/lib/seo";

/** Cache aligné sur les pages « Actualités » et « Événements » : l'accueil
 *  affiche les derniers communiqués et les prochaines rencontres, invalidés par
 *  les écritures de la console (cf. lib/actus/cache.ts, lib/events/cache.ts). */
export const revalidate = 120;

/* L'accueil déclare ses propres adresses, comme toute page : le layout n'en
   porte plus (cf. son generateMetadata), pour qu'une page oubliée ne puisse
   plus se présenter comme un doublon de l'accueil. */
export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  return metaPage({ lang, path: NAV.accueil, title: { absolute: t.seo.titreSite }, description: t.home.heroLead });
}

export default async function Home(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  // Lectures indépendantes, menées de front : aucune ne conditionne l'autre, et
  // les enchaîner ajouterait autant d'allers-retours à la base pour rien.
  const [actualites, upcoming, equipe, composantes, organes] = await Promise.all([
    derniersArticles(lang, 4),
    prochainsEvenements(lang, 3),
    membresEquipe(lang),
    composantesPubliques(lang),
    organesPublies(lang),
  ]);
  // Colonnes qui remplissent les grilles de vignettes et de logos (cf. lib/grille.ts).
  const grilleGalerie = grillePleine(galleryProvinces.length, 5, 3);
  // Logos : jusqu'à neuf par rangée (≈ 140 px par case à 1440 px, assez pour
  // un logotype de 46 px de haut), trois au moins.
  const grilleLogos = grillePleine(partners.length, 9, 3);

  // Données structurées : identifie l'organisation et le site pour les moteurs
  // (rich results, encart de connaissance) et déclare l'action de recherche.
  const donneesStructurees = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "GovernmentOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: "UGPTN",
        legalName: meta.uniteLong,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "UGPTN",
        inLanguage: lang === "en" ? "en" : "fr",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/${lang}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }}
      />
      {/* ===== HERO ===== */}
      <section data-hero style={{ position: "relative", borderBottom: "1px solid #1f2430", overflow: "hidden", background: "#0b0f1a", color: "#fff", minHeight: "calc(100svh - 64px)", display: "flex", flexDirection: "column" }}>
        <HeroVideo src={media.heroFilm} poster={media.img.hero} />
        <div className="hero-grid" style={{ position: "relative", flex: 1, width: "100%", maxWidth: "var(--maxw)", margin: "0 auto", padding: "clamp(40px,6vw,88px) var(--pad-x) 0", display: "grid", gridTemplateColumns: "1.35fr .9fr", gap: "clamp(32px,5vw,72px)", alignItems: "end", alignContent: "end" }}>
          <div style={{ paddingBottom: "clamp(48px,7vw,96px)" }}>
            {/* `eager` : le bloc de texte du héros est au-dessus de la ligne de
                flottaison (le titre est le candidat LCP). Rendu visible dès le
                SSR, il ne dépend pas de l'hydratation de framer-motion. */}
            <Reveal variant="fade" eager><Kicker light>{t.home.heroKicker}</Kicker></Reveal>
            <Reveal variant="mask" eager><h1 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(32px,6.2vw,82px)", lineHeight: 1.04, letterSpacing: "-0.03em", color: "#fff" }}>{t.home.heroTitle}</h1></Reveal>
            <Reveal variant="up" delay={0.1} eager><p style={{ margin: "28px 0 0", maxWidth: 560, fontSize: "clamp(16px,1.5vw,19px)", lineHeight: 1.6, color: "#c6c6c6" }}>{t.home.heroLead}</p></Reveal>
            <Reveal variant="up" delay={0.2} className="stack-sm" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 38 }}>
              <Link href={route(lang, NAV.projet)} className="btn btn--primary">{t.cta.discover}<span className="arrow">→</span></Link>
              <VideoButton id={media.heroFilm} className="btn backdrop-blur-[4px] max-[760px]:backdrop-blur-none" style={{ paddingLeft: 15, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.28)", color: "#fff" }} dataSlot="Film du projet (lecture avec son)" dataRatio="16:9">
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--ac)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, paddingLeft: 1 }}>▶</span>
                {t.video.watch}
              </VideoButton>
            </Reveal>
            <Reveal variant="fade" delay={0.3} className="hero-links" style={{ display: "flex", flexWrap: "wrap", marginTop: 40, borderTop: "1px solid rgba(255,255,255,.14)" }}>
              {[[t.cta.docs, NAV.transparence], [t.cta.marches, NAV.marches], [t.cta.mgp, NAV.mgp]].map(([label, slug], i) => (
                <Link key={i} href={route(lang, slug as string)} className="mono" style={{ display: "flex", alignItems: "center", gap: 9, padding: i === 0 ? "14px 22px 0 0" : "14px 22px 0", fontSize: 12.5, letterSpacing: "0.04em", color: "#c6c6c6", borderLeft: i ? "1px solid rgba(255,255,255,.14)" : "none" }}>
                  <span style={{ color: "var(--ac-light)" }}>↳</span>{label as string}
                </Link>
              ))}
            </Reveal>
          </div>
          {/* Panneau de chiffres : pas candidat LCP (c'est le titre), il peut donc
              glisser depuis la droite. Il reste une `div`, dernier enfant de
              `.hero-grid` (cf. `.hero-grid > div:last-child` en mobile). */}
          <Reveal variant="right" delay={0.2} className="hero-figures backdrop-blur-[8px] max-[760px]:backdrop-blur-none" style={{ border: "1px solid rgba(255,255,255,.14)", background: "rgba(13,17,26,.55)", marginBottom: "clamp(48px,7vw,96px)", color: "#fff" }}>
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
                  {/* Compteur pour les effectifs (« 26 », « 05 ») ; une année
                      (« 2029 ») ou un sigle restent du texte. */}
                  <span className="stat__num" style={{ fontSize: /^\d+$/.test(r.v) ? "clamp(24px,2.4vw,32px)" : 15, color: "#fff", letterSpacing: /^\d+$/.test(r.v) ? "-0.02em" : "0.04em" }}>
                    {/^\d{1,3}$/.test(r.v)
                      ? <Compteur valeur={Number(r.v)} locale={locale} options={{ minimumIntegerDigits: r.v.length }} />
                      : r.v}
                  </span>
                </div>
              </div>
            ))}
          </Reveal>
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
          <Reveal variant="left" className="mono" style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ac)" }}>[ 01 · {t.home.introKicker} ]</Reveal>
          <Reveal variant="right" delay={0.1}>
            <p style={{ margin: 0, fontSize: "clamp(22px,2.7vw,34px)", lineHeight: 1.4, letterSpacing: "-0.01em", fontWeight: 300 }}>{t.home.introLead}</p>
            <Reveal variant="up" delay={0.2} style={{ marginTop: 36, padding: "28px 30px", borderLeft: "3px solid var(--ac)", background: "var(--c-10)" }}>
              <p style={{ margin: 0, fontSize: "clamp(17px,1.8vw,21px)", lineHeight: 1.5, color: "var(--c-80)", fontStyle: "italic" }}>« {pick(question, lang)} »</p>
            </Reveal>
          </Reveal>
        </div>
      </section>

      {/* ===== COMPOSANTES =====
          Aperçu : la colonne des sous-composantes a été retirée. Elle recopiait
          ici le détail que portent l'index et chaque page dédiée, si bien que
          l'accueil disait tout et qu'il n'y avait plus de raison de cliquer. */}
      <section className="section">
        <div className="section__inner">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 48 }}>
            <Reveal>
              <Kicker n="02">{t.sec.composantes}</Kicker>
              <h2 className="h2">{t.home.composantesTitle}</h2>
            </Reveal>
            <Reveal variant="fade" delay={0.1} style={{ maxWidth: 260 }}><p className="mono" style={{ fontSize: 12, color: "var(--c-60)", textAlign: "right", maxWidth: 260, lineHeight: 1.6, margin: 0 }}>{t.home.composantesNote}</p></Reveal>
          </div>
          <RevealGroup style={{ borderTop: "1px solid var(--c-black)" }} gap={0.06} delayChildren={0.1}>
            {composantes.map((comp) => (
              <RevealItem key={comp.id}>
                <CompRow comp={comp} lang={lang} />
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal variant="fade" style={{ marginTop: 22, textAlign: "right" }}>
            <Link href={route(lang, NAV.composantes)} className="mono" style={{ fontSize: 13, color: "var(--ac)", display: "inline-flex", alignItems: "center", gap: 8 }}>{t.comp.seeAll} →</Link>
          </Reveal>
        </div>
      </section>

      {/* ===== RÉSULTATS / ODP =====
          Aperçu : les quatre indicateurs d'objectif, sans le point de départ ni
          la part de femmes, et sans les sept indicateurs intermédiaires. Tout
          cela est l'apport propre de la page « Résultats », qui ne recevait
          jusqu'ici qu'un seul lien de tout le site. */}
      <section className="section section--dark">
        <div className="section__inner">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 50 }}>
            <Reveal style={{ maxWidth: 700 }}>
              <Kicker light n="03">{t.sec.resultats}</Kicker>
              <h2 className="h2" style={{ margin: 0 }}>{t.home.resultatsTitle}</h2>
            </Reveal>
            <Reveal variant="fade" delay={0.2}>
              <Link href={route(lang, NAV.resultats)} className="mono" style={{ fontSize: 13, color: "var(--ac-light)", display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>{t.cta.resultats} →</Link>
            </Reveal>
          </div>
          <GrilleODP lang={lang} variante="apercu" />
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
          <Reveal variant="left">
            <Kicker n="04">{t.sec.couverture}</Kicker>
            <h2 className="h2">26 provinces.<br />10 {t.words.prio}.</h2>
            <p style={{ margin: "22px 0 0", fontSize: 16, lineHeight: 1.6, color: "var(--c-70)", maxWidth: 420 }}>{t.home.couvertureLead}</p>
            <div style={{ display: "flex", gap: 26, marginTop: 34 }}>
              <div><div className="stat__num" style={{ fontSize: 40 }}><Compteur valeur={26} locale={locale} /></div><div style={{ fontSize: 12.5, color: "var(--c-60)", marginTop: 4 }}>{t.words.provinces}</div></div>
              <div style={{ borderLeft: "1px solid var(--c-20)", paddingLeft: 26 }}><div className="stat__num" style={{ fontSize: 40, color: "var(--ac)" }}><Compteur valeur={10} locale={locale} /></div><div style={{ fontSize: 12.5, color: "var(--c-60)", marginTop: 4 }}>{t.lbl.prio}</div></div>
            </div>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 9, fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 11, height: 11, background: "var(--ac)" }} /><span style={{ color: "var(--c-80)" }}>{t.lbl.prio} (CPF)</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 11, height: 11, border: "1px solid var(--c-50)", background: "#fff" }} /><span style={{ color: "var(--c-80)" }}>{t.lbl.autres}</span></div>
            </div>
          </Reveal>
          {/* La carte garde sa propre entrée (tracé des provinces, `.is-visible`) ;
              l'enveloppe ne fait que la poser en léger zoom, en écho à la colonne. */}
          <Reveal variant="zoom" delay={0.1}>
            <ProvinceMap lang={lang} />
          </Reveal>
        </div>
      </section>

      {/* ===== GOUVERNANCE =====
          Aperçu : la nature de chaque organe. Qui préside, à quelle majorité et
          à quelle fréquence reste l'apport de la page « Gouvernance », qu'on
          retrouvait sinon à l'identique en suivant « en savoir plus ». */}
      <section className="section section--grey">
        <div className="section__inner">
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Reveal>
              <Kicker n="05">{t.sec.gouvernance}</Kicker>
              <h2 className="h2" style={{ margin: 0 }}>COPIL · CTP · UGPTN</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p style={{ margin: "18px 0 0", fontSize: 15.5, lineHeight: 1.6, color: "var(--c-70)" }}>{t.home.gouvLead}</p>
            </Reveal>
          </div>
          <RevealGroup className="grid-3" gap={0.06} delayChildren={0.1}>
            {organes.map((g) => (
              <RevealItem key={g.id} className="cell" style={{ padding: "30px 28px" }}>
                <CarteOrgane organe={g} lang={lang} champs="court" />
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal variant="fade" style={{ marginTop: 18, textAlign: "right" }}>
            <Link href={route(lang, NAV.gouvernance)} className="mono" style={{ fontSize: 13, color: "var(--ac)", display: "inline-flex", alignItems: "center", gap: 8 }}>{t.cta.more} →</Link>
          </Reveal>
        </div>
      </section>

      {/* ===== ÉQUIPE =====
          Le titre annonçait « 21 rôles · 5 pôles » en dur au-dessus d'une grille
          qui vient de la base. Le nombre de pôles est désormais dérivé, et le
          total de sous-rôles n'est plus avancé : l'Unité en compte vingt et un,
          dix-neuf sont renseignés, et les deux derniers s'ajouteront depuis la
          console (cf. `polesSousRoles` dans content/data.ts). */}
      <section className="section">
        <div className="section__inner">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 46 }}>
            <Reveal><Kicker n="06">{t.sec.equipe}</Kicker><h2 className="h2">{poles.length} {t.words.poles}</h2></Reveal>
            <Reveal delay={0.1} style={{ maxWidth: 340 }}><p style={{ maxWidth: 340, fontSize: 14.5, lineHeight: 1.55, color: "var(--c-60)", margin: 0 }}>{t.home.equipeLead}</p></Reveal>
          </div>
          {/* Grille administrée depuis la console (cf. src/lib/equipe/query.ts).
              Le même bloc sert la page « L'Unité », à l'habillage près. */}
          <GrilleEquipe membres={equipe} variante="accueil" />
        </div>
      </section>

      {/* ===== ACTUALITÉS ===== */}
      <section className="section">
        <div className="section__inner">
          <Reveal><Kicker n="07">{t.sec.actus}</Kicker></Reveal>
          <RevealGroup gap={0.06} delayChildren={0.1} style={{ borderTop: "1px solid var(--c-black)" }}>
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
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 36 }}>
              <Reveal style={{ maxWidth: 620 }}><Kicker>{t.home.evtLabel}</Kicker><h2 className="h2--sm" style={{ marginBottom: 12 }}>{t.home.evtTitle}</h2><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "var(--c-70)" }}>{t.home.evtLead}</p></Reveal>
              <Reveal variant="fade" delay={0.2}><Link href={route(lang, NAV.evenements)} className="btn btn--outline" style={{ whiteSpace: "nowrap" }}>{t.home.evtUpcoming} →</Link></Reveal>
            </div>
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
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ margin: "0 0 40px", fontSize: 15.5, lineHeight: 1.6, color: "var(--c-70)", maxWidth: 680 }}>{t.home.galleryLead}</p>
          </Reveal>
          {/* Vignettes photo : fondu + léger zoom arrière, en cascade.
              Cinq colonnes au plus en pleine largeur ; `grillePleine` en
              retient un diviseur du nombre de vignettes (8 → 4 × 2) pour ne
              pas laisser trois cases seules sous une rangée pleine. */}
          <RevealGroup gap={0.06} delayChildren={0.1} className={`celled-flow ${grilleGalerie.className ?? ""}`} style={{ gridTemplateColumns: "repeat(auto-fill,minmax(216px,1fr))", ...grilleGalerie.style }}>
            {galleryProvinces.map((g) => (
              <RevealItem key={g.nom} zoom className="duo" style={{ aspectRatio: "4/3" }}>
                {/* sizes ajusté à la grille `minmax(216px,1fr)` : 1 colonne
                    sous 480px, 2 entre 480 et 760px, ~300px au-delà — évite de
                    télécharger une image pleine largeur pour une case d'un tiers. */}
                <Photo src={media.img[g.img]} alt={g.nom} sizes="(max-width: 480px) 100vw, (max-width: 760px) 50vw, 300px" />
                <div style={{ position: "absolute", left: 14, right: 14, bottom: 13, fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.25 }}>{g.nom}</div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ===== PARTENAIRES ===== */}
      <section className="section section--sm">
        <div className="section__inner">
          <div style={{ marginBottom: 40, maxWidth: 640 }}>
            <Reveal><Kicker>{t.home.partenairesLabel}</Kicker><h2 className="h2--sm" style={{ marginBottom: 14 }}>{t.home.partenairesTitle}</h2></Reveal>
            <Reveal delay={0.1}><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "var(--c-70)" }}>{t.home.partenairesLead}</p></Reveal>
          </div>
          {/* Le pas automatique de 180 px donne sept colonnes en pleine
              largeur : neuf partenaires y laissaient deux logos seuls sous une
              rangée pleine. `grillePleine` retient un nombre de colonnes qui
              tombe juste — 9 → une rangée de neuf, 10 → 5 × 2, 12 → 6 × 2. */}
          <RevealGroup gap={0.04} delayChildren={0.1} className={`logos-grid ${grilleLogos.className ?? ""}`} style={grilleLogos.style}>
            {partners.map((p) => (
              <RevealItem key={p.name} className="logo-cell">
                {p.logo ? (
                  /* Les neuf logos pesaient 988 Ko de PNG servis tels quels sur
                     le premier écran, pour un affichage de 46 px de haut :
                     l'optimiseur les ramène au format rendu et les convertit en
                     AVIF. Le cadre porte les dimensions (cf. `.logo-cell__mark`
                     dans globals.css), le logotype s'y inscrit sans déformation.
                     `sizes` décrit la place RÉELLE : trois colonnes sous 760 px,
                     un cadre d'environ 180 px au-delà. */
                  <span className="logo-cell__mark">
                    <Image
                      src={p.logo}
                      alt={p.name}
                      fill
                      sizes="(max-width: 760px) 26vw, 200px"
                      style={{ objectFit: "contain" }}
                    />
                  </span>
                ) : (
                  <div style={{ fontSize: 13.5, fontWeight: 600, textAlign: "center", lineHeight: 1.25 }}>{p.name}</div>
                )}
                <div className="logo-cell__kind">{pick(p.kind, lang)}</div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ===== RÉPONDRE À UN MARCHÉ =====

          Cette section a remplacé un inventaire des huit espaces de la
          plateforme métier. Il décrivait l'architecture d'un outil INTERNE sur
          la page d'accueil publique : un citoyen n'a rien à en faire, et les
          huit tuiles se lisaient « Partenaire → Espace partenaire », c'est-à-dire
          rien du tout.

          ⚠️ La place compte autant que le contenu. C'est la dernière section
          d'une page longue, donc le seul moment où l'on s'adresse à quelqu'un
          qui a TOUT lu — le lecteur le plus disposé à agir de la journée. La
          dépenser en architecture logicielle, c'est la perdre.

          Pourquoi les entreprises, et pas une autre porte : le héros mène déjà
          aux documents, aux avis et au mécanisme de plaintes, et le bloc
          d'abonnement figure au pied de CHAQUE page. Les répéter ici ne
          servirait personne. Il restait une audience majeure que la page
          n'adressait nulle part, alors que la page existe pour elle et que
          `/bidders` l'attend : les entreprises candidates. */}
      <section className="section section--pale">
        <div className="section__inner">
          <div className="cols2" style={{ alignItems: "end", marginBottom: 46 }}>
            <Reveal variant="left"><Kicker n="08">{t.sec.repondre}</Kicker><h2 className="h2--sm">{t.home.repondreTitle}</h2></Reveal>
            <Reveal variant="right" delay={0.1}><p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--c-80)", margin: 0, maxWidth: 460 }}>{t.home.repondreLead}</p></Reveal>
          </div>

          {/* Trois étapes, numérotées : le parcours se lit d'un coup d'œil, et
              son nombre fini est ce qui décide quelqu'un à le commencer. */}
          <RevealGroup className="grid-3" gap={0.06} delayChildren={0.1} style={{ "--filet": "var(--ac-line)" } as CSSProperties}>
            {t.home.repondreEtapes.map((e) => (
              <RevealItem key={e.n} style={{ background: "#fff", padding: "26px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--ac)" }}>{e.n}</div>
                <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{pick(e.titre, lang)}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--c-70)" }}>{pick(e.texte, lang)}</div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1} style={{ marginTop: 34, display: "flex", flexWrap: "wrap", gap: 14 }}>
            <Link href={route(lang, NAV.soumissionnaires)} className="btn btn--primary">
              {t.home.repondreCta}<span className="arrow">→</span>
            </Link>
            <Link href={route(lang, NAV.marches)} className="btn btn--outline">
              {t.home.repondreAvis}
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
