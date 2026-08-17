import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asLang, LOCALES } from "@/lib/params";
import { dict } from "@/content/i18n";
import { NAV, route, compRoute } from "@/lib/routes";
import { compTintDe, onCompDe } from "@/lib/comp";
import { composantePublique, slugsComposantes } from "@/lib/projet/query";
import { membreComposante } from "@/lib/equipe/query";
import { Kicker } from "@/components/ui/Kicker";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { FilAriane } from "@/components/ui/FilAriane";
import { CtaFin } from "@/components/ui/CtaFin";
import { GrilleODP } from "@/components/resultats/GrilleODP";
import { CompSubNav, type SubNavAnchor } from "@/components/composantes/CompSubNav";
import { AnchorLink } from "@/components/composantes/AnchorLink";
import { CompProblematique } from "@/components/composantes/CompProblematique";
import { CompVideo } from "@/components/composantes/CompVideo";
import { ProjetsPhares } from "@/components/composantes/ProjetsPhares";
import { CompResponsable } from "@/components/composantes/CompResponsable";
import { CompLies } from "@/components/composantes/CompLies";

/**
 * Adresses pré-générées, lues en base.
 *
 * ⚠️ `dynamicParams` est passé à `true` en même temps que les composantes ont
 * quitté le code : une composante créée en console doit répondre sans attendre
 * une reconstruction. Un slug inconnu tombe sur le `notFound()` ci-dessous,
 * comme avant — la différence est qu'il est décidé en lisant la base, et non
 * par la liste figée au build.
 */
export async function generateStaticParams() {
  const slugs = await slugsComposantes();
  return LOCALES.flatMap((lang) => slugs.map((code) => ({ lang, code })));
}
export const dynamicParams = true;

/** La page lit la base : même politique de cache que les autres pages du groupe. */
export const revalidate = 120;

export async function generateMetadata(props: { params: Promise<{ lang: string; code: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const trouve = await composantePublique(params.code, lang);
  if (!trouve) return {};

  const { composante } = trouve;
  const t = dict(lang).comp;
  const title = `${t.one} ${composante.code.slice(1)} — ${composante.titre}`;
  const description = composante.soustitre;
  const path = `/${lang}${NAV.composantes}/${composante.slug}`;
  return {
    title,
    description,
    openGraph: { title, description, url: path, type: "article" },
    alternates: {
      canonical: path,
      languages: {
        fr: `/fr${NAV.composantes}/${composante.slug}`,
        en: `/en${NAV.composantes}/${composante.slug}`,
      },
    },
  };
}

export default async function ComposantePage(props: { params: Promise<{ lang: string; code: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);

  const trouve = await composantePublique(params.code, lang);
  if (!trouve) notFound();

  const { composante: comp, toutes } = trouve;

  // Responsable administré depuis la console. `null` quand aucune fiche
  // publiée ne se rattache à la composante : la section disparaît alors, comme
  // elle le faisait sans profil renseigné.
  const responsable = await membreComposante(comp.code, lang);

  const t = dict(lang);
  const c = t.comp;
  const num = comp.code.slice(1);
  const onColor = onCompDe(comp.color);

  const idx = toutes.findIndex((item) => item.code === comp.code);
  const prev = idx > 0 ? toutes[idx - 1] : null;
  const next = idx >= 0 && idx < toutes.length - 1 ? toutes[idx + 1] : null;

  const tabs = toutes.map((item) => ({
    code: item.code,
    label: item.titre,
    href: compRoute(lang, item.slug),
    color: item.color,
    active: item.code === comp.code,
  }));

  const anchors: SubNavAnchor[] = [
    ...(comp.problematique ? [{ id: "problematique", label: c.aProblematique }] : []),
    { id: "contexte", label: c.aContexte },
    ...(comp.video ? [{ id: "video", label: c.aVideo }] : []),
    ...(comp.objectifs.length ? [{ id: "objectifs", label: c.aObjectifs }] : []),
    ...(comp.projets.length ? [{ id: "projets", label: c.aProjets }] : []),
    ...(comp.ecosysteme || comp.odpCodes.length ? [{ id: "ecosysteme", label: c.aEcosysteme }] : []),
    ...(comp.finalite ? [{ id: "finalite", label: c.aFinalite }] : []),
    ...(responsable ? [{ id: "responsable", label: c.aResponsable }] : []),
  ];

  return (
    <div className="comp-page" style={compTintDe(comp.color)}>
      {/* ===== HÉROS ===== */}
      <section className="comp-hero">
        <div className="section__inner comp-hero__inner">
          <div>
            <Reveal variant="fade">
              {/* Le fil sautait « Le Projet », alors que les composantes en
                  relèvent dans la navigation, et sa première maille s'appelait
                  « UGPTN » alors qu'une page porte ce nom. */}
              <FilAriane
                label={t.lbl.ariane}
                className="comp-hero__crumb mono"
                items={[
                  { label: t.nav.accueil, href: route(lang) },
                  { label: t.nav.projet, href: route(lang, NAV.projet) },
                  { label: c.titre, href: route(lang, NAV.composantes) },
                  { label: `${c.one} ${num}` },
                ]}
              />
            </Reveal>

            <Reveal variant="fade" delay={0.05}>
              <div className="comp-hero__badges">
                <span className="mono comp-hero__code" style={{ background: comp.color, color: onColor }}>
                  {comp.code}
                </span>
                <span className="mono comp-hero__kind">{comp.titre}</span>
              </div>
            </Reveal>

            <Reveal variant="mask" delay={0.08}>
              <h1 className="comp-hero__h1">{comp.titreLong}</h1>
            </Reveal>

            <Reveal variant="up" delay={0.14}>
              <p className="comp-hero__lead">{comp.soustitre}</p>
            </Reveal>

            <Reveal variant="up" delay={0.2} className="comp-hero__cta stack-sm">
              {comp.projets.length > 0 && (
                <AnchorLink to="projets" className="btn btn--primary">
                  {c.secProjets} <span className="arrow">↓</span>
                </AnchorLink>
              )}
              {comp.video && (
                <AnchorLink to="video" className="btn btn--on-dark">{c.videoLabel}</AnchorLink>
              )}
              <Link href={route(lang, NAV.composantes)} className="btn btn--on-dark">{c.seeAll}</Link>
            </Reveal>
          </div>

          {/* Encart chiffres */}
          <Reveal variant="fade" delay={0.12} className="comp-hero__figures">
            <div className="mono comp-hero__figures-head">
              <span>{c.perimetre}</span>
              <span style={{ color: "var(--ac-light)" }}>{comp.code}</span>
            </div>
            <div className="comp-hero__figure comp-hero__figure--big">
              <div className="stat__num">
                {comp.projets.length > 0 ? <Counter to={comp.projets.length} dur={900} /> : "—"}
              </div>
              <div className="mono comp-hero__sub">
                {comp.projets.length > 0 ? c.share : c.noDotation}
              </div>
            </div>
            <div className="comp-hero__figure comp-hero__split">
              <div>
                <div className="mono comp-hero__k">{c.sousTitle}</div>
                <div className="mono comp-hero__v">{comp.sous.length || "—"}</div>
              </div>
              <div>
                <div className="mono comp-hero__k">{c.objectifsCount}</div>
                <div className="mono comp-hero__v">{comp.objectifs.length}</div>
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
                  {comp.projets.length > 0 ? c.statutExec : c.statutReserve}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CompSubNav tabs={tabs} anchors={anchors} />

      {/* ===== PROBLÉMATIQUE ===== */}
      <CompProblematique comp={comp} voisines={toutes} lang={lang} />

      {/* ===== CONTEXTE ===== */}
      <section className="section section--grey" id="contexte" data-anchor>
        <div className="section__inner comp-contexte">
          <div>
            <Reveal>
              <Kicker>{c.secContexte}</Kicker>
            </Reveal>
            <RevealGroup gap={0.05}>
              {comp.chapeau.map((para, i) => (
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
                  <li key={s.id}>
                    {s.reference && (
                      <div className="mono comp-aside__row"><span>{s.reference}</span></div>
                    )}
                    <div className="comp-aside__text">{s.titre}</div>
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
      <CompVideo comp={comp} lang={lang} />

      {/* ===== OBJECTIFS ===== */}
      {comp.objectifs.length > 0 && (
        <section className="section" id="objectifs" data-anchor>
          <div className="section__inner">
            <Reveal>
              <Kicker>{c.secObjectifs}</Kicker>
              <h2 className="h2--sm comp-h2">
                {comp.objectifs.length} {c.objectifsCount}
              </h2>
            </Reveal>
            <RevealGroup className="comp-objectifs" gap={0.035}>
              {comp.objectifs.map((o, i) => (
                <RevealItem key={o.id} className="comp-objectif">
                  <span className="mono comp-objectif__n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="comp-objectif__t">{o.texte}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ===== PROJETS PHARES ===== */}
      {comp.projets.length > 0 && (
        <section className="section" id="projets" data-anchor>
          <div className="section__inner">
            <Reveal>
              <Kicker>{c.secProjets}</Kicker>
              <h2 className="h2--sm comp-h2">
                {comp.projets.length} {c.projets}
              </h2>
              <p className="lead comp-lead">{c.secProjetsLead}</p>
            </Reveal>
            <ProjetsPhares projets={comp.projets} label={c.secProjets} />
          </div>
        </section>
      )}

      {/* ===== ÉCOSYSTÈME + INDICATEURS ===== */}
      {(comp.ecosysteme || comp.odpCodes.length > 0) && (
        <section className="section section--dark" id="ecosysteme" data-anchor>
          <div className="section__inner">
            {comp.ecosysteme && (
              <>
                <Reveal>
                  <Kicker light>{c.secEcosysteme}</Kicker>
                  <h2 className="h2--sm comp-h2">{comp.ecosysteme.titre}</h2>
                  <p className="comp-eco__lead">{comp.ecosysteme.lead}</p>
                </Reveal>
                <RevealGroup className="comp-eco" gap={0.045}>
                  {comp.ecosysteme.couches.map((k, i) => (
                    <RevealItem key={k.id} className="comp-eco__row">
                      <span className="mono comp-eco__n">{String(i + 1).padStart(2, "0")}</span>
                      <span className="comp-eco__t">{k.titre}</span>
                      <span className="comp-eco__d">{k.texte}</span>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </>
            )}

            {comp.odpCodes.length > 0 && (
              <div className={comp.ecosysteme ? "comp-odp comp-odp--after" : "comp-odp"}>
                <Reveal>
                  <Kicker light>{c.secIndicateurs}</Kicker>
                </Reveal>
                {/* Quatrième copie de la même grille jusqu'ici, avec ses propres
                    tailles : le composant partagé la sert désormais partout. */}
                <GrilleODP lang={lang} variante="complet" codes={comp.odpCodes} />
                <Link href={route(lang, NAV.resultats)} className="mono comp-aside__link">
                  {t.cta.resultats} →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== FINALITÉ ===== */}
      {comp.finalite && (
        <section className="section section--pale" id="finalite" data-anchor>
          <div className="section__inner">
            <Reveal>
              <Kicker>{c.secFinalite}</Kicker>
              <h2 className="h2--sm comp-h2">{comp.finalite.titre}</h2>
              <p className="lead comp-lead">{comp.finalite.lead}</p>
            </Reveal>
            <RevealGroup className="comp-finalite" gap={0.04}>
              {comp.finalite.points.map((p) => (
                <RevealItem key={p.id} className="comp-finalite__item">
                  <span className="comp-finalite__mark" aria-hidden />
                  <span>{p.texte}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ===== RESPONSABLE ===== */}
      <CompResponsable membre={responsable} comp={comp} lang={lang} />

      {/* ===== CONTENUS RATTACHÉS ===== */}
      <CompLies code={comp.code} lang={lang} />

      {/* ===== PAGER + CTA =====
          Le pager passe en `avant` du bloc partagé : il reste dans la même
          bande sombre plutôt que d'en ouvrir une seconde. */}
      <CtaFin
        avant={
          <div className={prev && next ? "comp-pager" : "comp-pager comp-pager--single"}>
            {prev ? (
              <Link href={compRoute(lang, prev.slug)} className="comp-pager__link">
                <span className="mono comp-pager__k">← {c.prev}</span>
                <span className="comp-pager__t">
                  <span className="mono" style={{ color: prev.color }}>{prev.code}</span>{" "}
                  {prev.titre}
                </span>
              </Link>
            ) : null}
            {next ? (
              <Link href={compRoute(lang, next.slug)} className="comp-pager__link comp-pager__link--next">
                <span className="mono comp-pager__k">{c.next} →</span>
                <span className="comp-pager__t">
                  <span className="mono" style={{ color: next.color }}>{next.code}</span>{" "}
                  {next.titre}
                </span>
              </Link>
            ) : null}
          </div>
        }
        liens={[
          { href: route(lang, NAV.marches), label: t.cta.marches },
          { href: route(lang, NAV.actualites), label: t.sec.actus },
          { href: route(lang, NAV.contact), label: t.nav.contact },
        ]}
      />
    </div>
  );
}
