import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asLang, LOCALES } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { composantes, odp as odpAll } from "@/content/data";
import { composantesDetail, composanteDetail } from "@/content/composantes-detail";
import { NAV, route, compRoute } from "@/lib/routes";
import { compColor, compTint, onComp } from "@/lib/comp";
import { membreComposante } from "@/lib/equipe/query";
import { Kicker } from "@/components/ui/Kicker";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { CompSubNav, type SubNavAnchor } from "@/components/composantes/CompSubNav";
import { AnchorLink } from "@/components/composantes/AnchorLink";
import { CompProblematique } from "@/components/composantes/CompProblematique";
import { CompVideo } from "@/components/composantes/CompVideo";
import { ProjetsPhares } from "@/components/composantes/ProjetsPhares";
import { CompResponsable } from "@/components/composantes/CompResponsable";
import { CompLies } from "@/components/composantes/CompLies";

/** 5 composantes × 2 langues, pré-générées ; tout autre code renvoie 404. */
export function generateStaticParams() {
  return LOCALES.flatMap((lang) => composantesDetail.map((d) => ({ lang, code: d.slug })));
}
export const dynamicParams = false;

/** Le bloc « Actualités » de la page lit la base : même politique de cache que
 *  la page « Actualités » elle-même (cf. app/[lang]/actualites/page.tsx). */
export const revalidate = 120;

export async function generateMetadata(props: { params: Promise<{ lang: string; code: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const detail = composanteDetail(params.code);
  if (!detail) return {};
  const comp = composantes.find((c) => c.code === detail.code);
  const t = dict(lang).comp;
  const title = `${t.one} ${detail.code.slice(1)} — ${comp ? pick(comp.titre, lang) : pick(detail.titreLong, lang)}`;
  const description = pick(detail.soustitre, lang);
  const path = `/${lang}${NAV.composantes}/${detail.slug}`;
  return {
    title,
    description,
    openGraph: { title, description, url: path, type: "article" },
    alternates: {
      canonical: path,
      languages: {
        fr: `/fr${NAV.composantes}/${detail.slug}`,
        en: `/en${NAV.composantes}/${detail.slug}`,
      },
    },
  };
}

export default async function ComposantePage(props: { params: Promise<{ lang: string; code: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const detail = composanteDetail(params.code);
  if (!detail) notFound();

  const comp = composantes.find((c) => c.code === detail.code);
  if (!comp) notFound();

  // Responsable administré depuis la console. `null` quand aucune fiche
  // publiée ne se rattache à la composante : la section disparaît alors, comme
  // elle le faisait sans profil renseigné.
  const responsable = await membreComposante(detail.code, lang);

  const t = dict(lang);
  const c = t.comp;
  const num = detail.code.slice(1);
  const color = compColor(detail.code);
  const onColor = onComp(detail.code);
  const odpLies = odpAll.filter((o) => detail.odp?.includes(o.code));

  const idx = composantesDetail.findIndex((d) => d.code === detail.code);
  const prev = idx > 0 ? composantesDetail[idx - 1] : null;
  const next = idx < composantesDetail.length - 1 ? composantesDetail[idx + 1] : null;
  const compOf = (code: string) => composantes.find((x) => x.code === code);

  const tabs = composantesDetail.map((d) => ({
    code: d.code,
    label: pick(compOf(d.code)?.titre ?? d.titreLong, lang),
    href: compRoute(lang, d.slug),
    color: compColor(d.code),
    active: d.code === detail.code,
  }));

  const anchors: SubNavAnchor[] = [
    ...(detail.problematique ? [{ id: "problematique", label: c.aProblematique }] : []),
    { id: "contexte", label: c.aContexte },
    ...(detail.video ? [{ id: "video", label: c.aVideo }] : []),
    { id: "objectifs", label: c.aObjectifs },
    ...(detail.projets.length ? [{ id: "projets", label: c.aProjets }] : []),
    ...(detail.ecosysteme || odpLies.length ? [{ id: "ecosysteme", label: c.aEcosysteme }] : []),
    ...(detail.finalite ? [{ id: "finalite", label: c.aFinalite }] : []),
    ...(responsable ? [{ id: "responsable", label: c.aResponsable }] : []),
  ];

  return (
    <div className="comp-page" style={compTint(detail.code)}>
      {/* ===== HÉROS ===== */}
      <section className="comp-hero">
        <div className="section__inner comp-hero__inner">
          <div>
            <Reveal variant="fade">
              <div className="comp-hero__crumb mono">
                <Link href={route(lang)}>UGPTN</Link>
                <span aria-hidden> / </span>
                <Link href={route(lang, NAV.composantes)}>{c.titre}</Link>
                <span aria-hidden> / </span>
                <span>{c.one} {num}</span>
              </div>
            </Reveal>

            <Reveal variant="fade" delay={0.05}>
              <div className="comp-hero__badges">
                <span className="mono comp-hero__code" style={{ background: color, color: onColor }}>
                  {detail.code}
                </span>
                <span className="mono comp-hero__kind">{pick(comp.titre, lang)}</span>
              </div>
            </Reveal>

            <Reveal variant="mask" delay={0.08}>
              <h1 className="comp-hero__h1">{pick(detail.titreLong, lang)}</h1>
            </Reveal>

            <Reveal variant="up" delay={0.14}>
              <p className="comp-hero__lead">{pick(detail.soustitre, lang)}</p>
            </Reveal>

            <Reveal variant="up" delay={0.2} className="comp-hero__cta stack-sm">
              {detail.projets.length > 0 && (
                <AnchorLink to="projets" className="btn btn--primary">
                  {c.secProjets} <span className="arrow">↓</span>
                </AnchorLink>
              )}
              {detail.video && (
                <AnchorLink to="video" className="btn btn--on-dark">{c.videoLabel}</AnchorLink>
              )}
              <Link href={route(lang, NAV.composantes)} className="btn btn--on-dark">{c.seeAll}</Link>
            </Reveal>
          </div>

          {/* Encart chiffres */}
          <Reveal variant="fade" delay={0.12} className="comp-hero__figures">
            <div className="mono comp-hero__figures-head">
              <span>{c.budget}</span>
              <span style={{ color: "var(--ac-light)" }}>{detail.code}</span>
            </div>
            <div className="comp-hero__figure comp-hero__figure--big">
              <div className="stat__num">
                {detail.projets.length > 0 ? <Counter to={detail.projets.length} dur={900} /> : "—"}
              </div>
              <div className="mono comp-hero__sub">
                {detail.projets.length > 0 ? c.share : c.noDotation}
              </div>
            </div>
            <div className="comp-hero__figure comp-hero__split">
              <div>
                <div className="mono comp-hero__k">{c.sousTitle}</div>
                <div className="mono comp-hero__v">{comp.sous.length || "—"}</div>
              </div>
              <div>
                <div className="mono comp-hero__k">{c.objectifsCount}</div>
                <div className="mono comp-hero__v">{detail.objectifs.length}</div>
              </div>
            </div>
            <div className="comp-hero__figure comp-hero__split">
              <div>
                <div className="mono comp-hero__k">{c.horizon}</div>
                <div className="mono comp-hero__v">2029</div>
              </div>
              <div>
                <div className="mono comp-hero__k">{c.statut}</div>
                <div className="mono comp-hero__v comp-hero__v--txt">
                  {detail.projets.length > 0 ? c.statutExec : c.statutReserve}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CompSubNav tabs={tabs} anchors={anchors} />

      {/* ===== PROBLÉMATIQUE ===== */}
      <CompProblematique pb={detail.problematique} lang={lang} />

      {/* ===== CONTEXTE ===== */}
      <section className="section section--grey" id="contexte" data-anchor>
        <div className="section__inner comp-contexte">
          <div>
            <Reveal>
              <Kicker>{c.secContexte}</Kicker>
            </Reveal>
            <RevealGroup gap={0.05}>
              {(lang === "en" ? detail.chapeau.en : detail.chapeau.fr).map((para, i) => (
                <RevealItem key={i}>
                  <p className={i === 0 ? "comp-chapeau comp-chapeau--first" : "comp-chapeau"}>{para}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <Reveal variant="fade" delay={0.1} className="comp-aside">
            <div className="mono comp-aside__head">{c.sousTitle}</div>
            {comp.sous.length > 0 ? (
              <ul className="comp-aside__list">
                {comp.sous.map((s) => (
                  <li key={s.ref}>
                    <div className="mono comp-aside__row"><span>{s.ref}</span></div>
                    <div className="comp-aside__text">{pick(s.text, lang)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="comp-aside__vide">{c.noSous}</p>
            )}
            <Link href={route(lang, NAV.projet)} className="mono comp-aside__link">
              {t.nav.projet} →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== VIDÉO DE PRÉSENTATION ===== */}
      <CompVideo video={detail.video} code={detail.code} lang={lang} />

      {/* ===== OBJECTIFS ===== */}
      <section className="section" id="objectifs" data-anchor>
        <div className="section__inner">
          <Reveal>
            <Kicker>{c.secObjectifs}</Kicker>
            <h2 className="h2--sm comp-h2">
              {detail.objectifs.length} {c.objectifsCount}
            </h2>
          </Reveal>
          <RevealGroup className="comp-objectifs" gap={0.035}>
            {detail.objectifs.map((o, i) => (
              <RevealItem key={i} className="comp-objectif">
                <span className="mono comp-objectif__n">{String(i + 1).padStart(2, "0")}</span>
                <span className="comp-objectif__t">{pick(o, lang)}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ===== PROJETS PHARES ===== */}
      {detail.projets.length > 0 && (
        <section className="section" id="projets" data-anchor>
          <div className="section__inner">
            <Reveal>
              <Kicker>{c.secProjets}</Kicker>
              <h2 className="h2--sm comp-h2">
                {detail.projets.length} {c.projets}
              </h2>
              <p className="lead comp-lead">{c.secProjetsLead}</p>
            </Reveal>
            <ProjetsPhares projets={detail.projets} lang={lang} />
          </div>
        </section>
      )}

      {/* ===== ÉCOSYSTÈME + INDICATEURS ===== */}
      {(detail.ecosysteme || odpLies.length > 0) && (
        <section className="section section--dark" id="ecosysteme" data-anchor>
          <div className="section__inner">
            {detail.ecosysteme && (
              <>
                <Reveal>
                  <Kicker light>{c.secEcosysteme}</Kicker>
                  <h2 className="h2--sm comp-h2">{pick(detail.ecosysteme.titre, lang)}</h2>
                  <p className="comp-eco__lead">{pick(detail.ecosysteme.lead, lang)}</p>
                </Reveal>
                <RevealGroup className="comp-eco" gap={0.045}>
                  {detail.ecosysteme.couches.map((k, i) => (
                    <RevealItem key={i} className="comp-eco__row">
                      <span className="mono comp-eco__n">{String(i + 1).padStart(2, "0")}</span>
                      <span className="comp-eco__t">{pick(k.t, lang)}</span>
                      <span className="comp-eco__d">{pick(k.d, lang)}</span>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </>
            )}

            {odpLies.length > 0 && (
              <div className={detail.ecosysteme ? "comp-odp comp-odp--after" : "comp-odp"}>
                <Reveal>
                  <Kicker light>{c.secIndicateurs}</Kicker>
                </Reveal>
                <RevealGroup className="comp-odp__grid celled--dark" gap={0.045}>
                  {odpLies.map((o) => (
                    <RevealItem key={o.code} className="cell comp-odp__cell">
                      <div className="mono comp-odp__code">{o.code}</div>
                      <div className="stat__num comp-odp__val">
                        <span className="stat__approx">{t.lbl.approx}</span>
                        <Counter to={o.value} dur={1300} />
                        <span className="comp-odp__unit">{o.unit}</span>
                      </div>
                      <div className="comp-odp__label">{pick(o.label, lang)}</div>
                      <div className="comp-odp__tags">
                        <span className="mono comp-odp__tag">{t.lbl.baseline}: {o.baseline}</span>
                        {o.femmes && <span className="mono comp-odp__tag comp-odp__tag--ac">{o.femmes}</span>}
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
                <p className="stat__note stat__note--dark">{t.lbl.indicatif}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== FINALITÉ ===== */}
      {detail.finalite && (
        <section className="section section--pale" id="finalite" data-anchor>
          <div className="section__inner">
            <Reveal>
              <Kicker>{c.secFinalite}</Kicker>
              <h2 className="h2--sm comp-h2">{pick(detail.finalite.titre, lang)}</h2>
              <p className="lead comp-lead">{pick(detail.finalite.lead, lang)}</p>
            </Reveal>
            <RevealGroup className="comp-finalite" gap={0.04}>
              {detail.finalite.points.map((p, i) => (
                <RevealItem key={i} className="comp-finalite__item">
                  <span className="comp-finalite__mark" aria-hidden />
                  <span>{pick(p, lang)}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ===== RESPONSABLE ===== */}
      <CompResponsable membre={responsable} comp={comp} lang={lang} />

      {/* ===== CONTENUS RATTACHÉS ===== */}
      <CompLies code={detail.code} lang={lang} />

      {/* ===== PAGER + CTA ===== */}
      <section className="section--dark comp-pager-wrap">
        <div className="section__inner">
          <div className={prev && next ? "comp-pager" : "comp-pager comp-pager--single"}>
            {prev ? (
              <Link href={compRoute(lang, prev.slug)} className="comp-pager__link">
                <span className="mono comp-pager__k">← {c.prev}</span>
                <span className="comp-pager__t">
                  <span className="mono" style={{ color: compColor(prev.code) }}>{prev.code}</span>{" "}
                  {pick(compOf(prev.code)?.titre ?? prev.titreLong, lang)}
                </span>
              </Link>
            ) : null}
            {next ? (
              <Link href={compRoute(lang, next.slug)} className="comp-pager__link comp-pager__link--next">
                <span className="mono comp-pager__k">{c.next} →</span>
                <span className="comp-pager__t">
                  <span className="mono" style={{ color: compColor(next.code) }}>{next.code}</span>{" "}
                  {pick(compOf(next.code)?.titre ?? next.titreLong, lang)}
                </span>
              </Link>
            ) : null}
          </div>

          <div className="comp-cta">
            <Link href={route(lang, NAV.marches)} className="btn btn--primary">
              {t.cta.marches} <span className="arrow">→</span>
            </Link>
            <Link href={route(lang, NAV.actualites)} className="btn btn--on-dark">{t.sec.actus}</Link>
            <Link href={route(lang, NAV.contact)} className="btn btn--on-dark">{t.nav.contact}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
