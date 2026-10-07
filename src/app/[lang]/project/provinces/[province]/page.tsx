import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asLang, LOCALES } from "@/lib/params";
import { dict } from "@/content/i18n";
import { provinces } from "@/content/data";
import { ODD, oddParNumero } from "@/content/odd";
import { pick } from "@/lib/pick";
import { NAV, route, compRoute } from "@/lib/routes";
import { CHEMIN_PROVINCES, provinceParSlug, provinceRoute, slugProvince, slugsProvinces } from "@/lib/provinces/chemins";
import { ficheProvince, projetsProvince, type ProjetVue } from "@/lib/provinces/query";
import type { AvancementProjet } from "@/lib/provinces/statut";
import { composantesPubliques } from "@/lib/projet/query";
import { PageHero } from "@/components/ui/PageHero";
import { FilAriane } from "@/components/ui/FilAriane";
import { Kicker } from "@/components/ui/Kicker";
import { CtaFin } from "@/components/ui/CtaFin";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { Compteur } from "@/components/motion/Compteur";
import { ProvinceMap } from "@/components/home/ProvinceMap";
import { metaPage } from "@/lib/seo";

/**
 * Page d'une province : fiche de référence, administration, statut dans le
 * projet, projets (en cours, prévus, achevés) et ODD visés.
 *
 * Atteinte au clic sur la carte (accueil, contact) ou par la liste des 26
 * provinces en bas de page. Les 26 adresses sont connues au build (table
 * figée, cf. lib/provinces/chemins.ts) : un segment inconnu est un 404. Fiche
 * et projets sont administrés depuis la console (module « Provinces »), avec
 * repli sur le contenu d'origine tant que la base n'en publie aucun.
 *
 * Une section sans donnée disparaît plutôt que d'afficher un gabarit vide.
 */
export function generateStaticParams() {
  return LOCALES.flatMap((lang) => slugsProvinces().map((province) => ({ lang, province })));
}
export const dynamicParams = false;
export const revalidate = 120;

type Props = { params: Promise<{ lang: string; province: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const p = provinceParSlug(params.province);
  if (!p) return {};

  const t = dict(lang).province;
  const fiche = await ficheProvince(slugProvince(p.nom), lang);
  return metaPage({
    lang,
    path: `${CHEMIN_PROVINCES}/${slugProvince(p.nom)}`,
    title: `${p.nom} · ${p.prio ? t.prio : t.autre}`,
    description: [fiche?.description, t.metaDesc].filter(Boolean).join(" "),
  });
}

const ORDRE: AvancementProjet[] = ["EN_COURS", "PREVU", "ACHEVE"];
/** Cartes affichées d'emblée par groupe ; les suivantes se déplient. */
const VISIBLES = 6;

export default async function ProvincePage(props: Props) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const p = provinceParSlug(params.province);
  if (!p) notFound();

  const slug = slugProvince(p.nom);
  const t = dict(lang);
  const pr = t.province;
  const [fiche, projets, composantes] = await Promise.all([
    ficheProvince(slug, lang),
    projetsProvince(slug, lang),
    composantesPubliques(lang),
  ]);

  const locale = lang === "en" ? "en-GB" : "fr-FR";
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const comp = new Map(composantes.map((c) => [c.code, c]));

  const libelleAvancement: Record<AvancementProjet, string> = {
    EN_COURS: pr.avEnCours,
    PREVU: pr.avPrevu,
    ACHEVE: pr.avAcheve,
  };
  const groupes = ORDRE.map((av) => ({ av, items: projets.filter((x) => x.avancement === av) })).filter((g) => g.items.length > 0);

  // ODD visés, du plus cité au moins cité.
  const comptesOdd = new Map<number, number>();
  for (const projet of projets) for (const n of projet.odd) comptesOdd.set(n, (comptesOdd.get(n) ?? 0) + 1);
  const oddVises = ODD.filter((o) => comptesOdd.has(o.n)).sort((a, b) => (comptesOdd.get(b.n) ?? 0) - (comptesOdd.get(a.n) ?? 0));

  const ordre = [...provinces].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const rangIci = ordre.findIndex((x) => x.nom === p.nom);
  const precedente = ordre[(rangIci - 1 + ordre.length) % ordre.length];
  const suivante = ordre[(rangIci + 1) % ordre.length];

  // La console admet une adresse OU un titre (« Journal officiel, 12 mars ») :
  // seul un lien http(s) devient un lien, le reste se lit tel quel.
  const sourceGouverneur = fiche?.gouverneurSource ?? null;
  const sourceEstLien = sourceGouverneur !== null && /^https?:\/\//i.test(sourceGouverneur);

  // Les grandeurs numériques défilent jusqu'à leur valeur (Compteur, même
  // locale que la page) ; le HTML rendu porte déjà la valeur finale formatée.
  const chiffres: { label: string; valeur: ReactNode; note?: string }[] = [];
  if (fiche?.chefLieu) chiffres.push({ label: pr.chefLieu, valeur: fiche.chefLieu });
  if (fiche?.population) {
    chiffres.push({
      label: pr.population,
      valeur: <Compteur valeur={fiche.population} locale={locale} />,
      note: fiche.populationAnnee ? `${pr.populationEst} ${fiche.populationAnnee}` : pr.populationEst,
    });
  }
  if (fiche?.superficieKm2) chiffres.push({ label: pr.superficie, valeur: <Compteur valeur={fiche.superficieKm2} locale={locale} suffixe=" km²" /> });
  if (fiche?.population && fiche.superficieKm2) {
    chiffres.push({
      label: pr.densite,
      valeur: <Compteur valeur={Math.round(fiche.population / fiche.superficieKm2)} locale={locale} suffixe={` ${pr.habKm2}`} />,
    });
  }
  // Petits entiers : affichés sans séparateur de milliers, comme auparavant.
  if (fiche?.territoires) chiffres.push({ label: pr.territoires, valeur: <Compteur valeur={fiche.territoires} locale={locale} options={{ useGrouping: false }} /> });
  if (fiche?.communes) chiffres.push({ label: pr.communes, valeur: <Compteur valeur={fiche.communes} locale={locale} options={{ useGrouping: false }} /> });

  return (
    <div>
      <PageHero
        crumb={
          <FilAriane
            label={t.lbl.ariane}
            items={[
              { label: t.nav.accueil, href: route(lang) },
              { label: t.nav.projet, href: route(lang, NAV.projet) },
              { label: t.nav.provinces, href: route(lang, NAV.provinces) },
              { label: p.nom },
            ]}
          />
        }
        title={p.nom}
        lead={fiche?.description ?? (p.prio ? pr.leadPrio : pr.leadAutre)}
      >
        <Reveal variant="up" delay={0.2}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 26 }}>
            <span className="mono prov-badge" data-prio={p.prio || undefined}>{p.prio ? pr.prio : pr.autre}</span>
            {fiche?.administration && <span className="mono prov-badge prov-badge--alerte">{fiche.administration}</span>}
          </div>
        </Reveal>
      </PageHero>

      {/* ===== EN BREF + ADMINISTRATION ===== */}
      {fiche && (chiffres.length > 0 || fiche.gouverneur) && (
        <section className="section">
          <div className="section__inner">
            <Reveal><Kicker>{pr.ficheLabel}</Kicker></Reveal>
            {/* Pas de cascade par cellule : RevealGroup n'a pas de <dl>, et une
                cellule masquée laisserait voir le fond gris des filets (gap 1px
                sur fond --c-20). Le bloc entier monte d'un seul tenant, les
                compteurs portent le mouvement. */}
            {chiffres.length > 0 && (
              <Reveal>
                <dl className="prov-chiffres">
                  {chiffres.map((c) => (
                    <div key={c.label} className="prov-chiffre">
                      <dt className="mono">{c.label}</dt>
                      <dd>
                        {c.valeur}
                        {c.note && <span className="prov-chiffre__note">{c.note}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}

            <RevealGroup className="prov-infos" gap={0.1}>
              <RevealItem>
                <h2 className="prov-h3">{pr.adminLabel}</h2>
                <dl className="prov-lignes">
                  <div>
                    <dt>{pr.gouverneur}</dt>
                    <dd>
                      {fiche.gouverneur ?? <span style={{ color: "var(--c-60)" }}>{pr.gouverneurInconnu}</span>}
                      {fiche.gouverneur && fiche.gouverneurDate && (
                        <span className="prov-lignes__note">
                          {pr.gouverneurAu} {date.format(new Date(fiche.gouverneurDate))}
                          {sourceGouverneur && (
                            <>
                              {" · "}
                              {sourceEstLien ? (
                                <a href={sourceGouverneur} target="_blank" rel="noopener noreferrer">{pr.source} ↗</a>
                              ) : (
                                <>{pr.source} : {sourceGouverneur}</>
                              )}
                            </>
                          )}
                        </span>
                      )}
                    </dd>
                  </div>
                  {fiche.viceGouverneur && (
                    <div>
                      <dt>{pr.viceGouverneur}</dt>
                      <dd>{fiche.viceGouverneur}</dd>
                    </div>
                  )}
                </dl>
              </RevealItem>
              {(fiche.villes.length > 0 || fiche.langues.length > 0) && (
                <RevealItem>
                  <h2 className="prov-h3">{pr.villesLangues}</h2>
                  <dl className="prov-lignes">
                    {fiche.villes.length > 0 && (
                      <div>
                        <dt>{pr.villes}</dt>
                        <dd>{fiche.villes.join(", ")}</dd>
                      </div>
                    )}
                    {fiche.langues.length > 0 && (
                      <div>
                        <dt>{pr.langues}</dt>
                        <dd style={{ textTransform: "capitalize" }}>{fiche.langues.join(", ")}</dd>
                      </div>
                    )}
                  </dl>
                </RevealItem>
              )}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ===== STATUT + CARTE ===== */}
      <section className="section" style={{ background: "var(--c-10)" }}>
        <div className="section__inner cols2 cols2--center" style={{ gridTemplateColumns: ".9fr 1.1fr" }}>
          <Reveal variant="left">
            <Kicker>{pr.statutLabel}</Kicker>
            <p style={{ margin: "18px 0 0", fontSize: 17, lineHeight: 1.65, color: "var(--c-80)", maxWidth: 460 }}>
              {p.prio ? pr.statutPrio : pr.statutAutre}
            </p>
            <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.6, color: "var(--c-60)", maxWidth: 460 }}>
              {pr.statutSuivi}{" "}
              <Link href={route(lang, NAV.resultats)} style={{ color: "var(--ac)" }}>{t.resultats.titre} →</Link>
            </p>
          </Reveal>
          <Reveal variant="zoom" delay={0.1}>
            <ProvinceMap lang={lang} selection={p.nom} />
          </Reveal>
        </div>
      </section>

      {/* ===== PROJETS ===== */}
      {groupes.length > 0 && (
        <section className="section" id="projets">
          <div className="section__inner">
            <Reveal>
              <Kicker>{pr.projetsLabel}</Kicker>
              <p style={{ margin: "14px 0 0", fontSize: 15.5, lineHeight: 1.6, color: "var(--c-70)", maxWidth: 640 }}>{pr.projetsLead}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <nav className="prov-compteurs" aria-label={pr.projetsLabel}>
                {groupes.map((g) => (
                  <a key={g.av} href={`#av-${g.av.toLowerCase()}`} className="prov-compteur" data-av={g.av}>
                    <span className="prov-compteur__n"><Compteur valeur={g.items.length} locale={locale} /></span>
                    <span>{libelleAvancement[g.av]}</span>
                  </a>
                ))}
              </nav>
            </Reveal>
            {groupes.map((g) => (
              <div key={g.av} id={`av-${g.av.toLowerCase()}`} className="prov-groupe">
                <Reveal>
                  <h2 className="prov-h3">
                    <span className="prov-point" data-av={g.av} aria-hidden />
                    {libelleAvancement[g.av]} <span style={{ color: "var(--c-50)", fontWeight: 400 }}>({g.items.length})</span>
                  </h2>
                </Reveal>
                {/* Cartes en fondu seul : `.prov-projet:hover` translate, et un
                    transform inline laissé par framer bloquerait ce survol. */}
                <RevealGroup as="ul" className="prov-projets" gap={0.06}>
                  {g.items.slice(0, VISIBLES).map((projet) => (
                    <CarteProjet key={projet.id} projet={projet} lang={lang} comp={projet.composante ? comp.get(projet.composante) : undefined} />
                  ))}
                </RevealGroup>
                {/* Au-delà de VISIBLES, repliés : trente cartes empilées
                    faisaient quinze mille pixels au téléphone. <details> natif,
                    sans script, et le contenu reste dans le HTML indexé. */}
                {g.items.length > VISIBLES && (
                  <details className="prov-plus">
                    <summary className="mono">{pr.voirPlus.replace("{n}", String(g.items.length - VISIBLES))}</summary>
                    {/* Révélée à l'ouverture : tant que <details> est fermé,
                        la liste n'a pas de boîte et n'entre pas dans la vue. */}
                    <RevealGroup as="ul" className="prov-projets" gap={0.06}>
                      {g.items.slice(VISIBLES).map((projet) => (
                        <CarteProjet key={projet.id} projet={projet} lang={lang} comp={projet.composante ? comp.get(projet.composante) : undefined} />
                      ))}
                    </RevealGroup>
                  </details>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== ODD ===== */}
      {oddVises.length > 0 && (
        <section className="section section--dark">
          <div className="section__inner">
            <Reveal>
              <Kicker light>{pr.oddLabel}</Kicker>
              <p style={{ margin: "14px 0 0", fontSize: 15.5, lineHeight: 1.6, color: "var(--c-30)", maxWidth: 620 }}>{pr.oddLead}</p>
            </Reveal>
            {/* Fondu seul plutôt que zoom : `.prov-odd li:hover` translate, et
                le transform inline d'un zoom framer neutraliserait ce survol. */}
            <RevealGroup as="ul" className="prov-odd" gap={0.06}>
              {oddVises.map((o) => (
                <RevealItem as="li" fade key={o.n} style={{ background: o.couleur }}>
                  <span className="prov-odd__n">{o.n}</span>
                  <span className="prov-odd__t">{pick(o.titre, lang)}</span>
                  <span className="mono prov-odd__c">{comptesOdd.get(o.n)} {pr.oddProjets}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ===== LES 26 PROVINCES ===== */}
      <section className="section">
        <div className="section__inner">
          <nav className="prov-voisines" aria-label={pr.toutesLabel}>
            {/* Chaque lien arrive de son côté ; l'enveloppe en grille garde le
                lien étiré sur toute la cellule (hauteurs égales). */}
            <Reveal variant="left" style={{ display: "grid" }}>
              <Link href={provinceRoute(lang, precedente.nom)} rel="prev">
                <span className="mono">← {pr.precedente}</span>
                <strong>{precedente.nom}</strong>
              </Link>
            </Reveal>
            <Reveal variant="right" style={{ display: "grid" }}>
              <Link href={provinceRoute(lang, suivante.nom)} rel="next" data-suivante>
                <span className="mono">{pr.suivante} →</span>
                <strong>{suivante.nom}</strong>
              </Link>
            </Reveal>
          </nav>

          <Reveal><Kicker>{pr.toutesLabel}</Kicker></Reveal>
          <RevealGroup as="ul" className="prov-liste" gap={0.04}>
            {ordre.map((x) => {
              const ici = x.nom === p.nom;
              return (
                <RevealItem as="li" key={x.nom}>
                  <Link href={provinceRoute(lang, x.nom)} aria-current={ici ? "page" : undefined}>
                    <span aria-hidden data-prio={x.prio || undefined} />
                    {x.nom}
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>

        </div>
      </section>

      <CtaFin
        titre={pr.ctaTitre}
        lead={pr.ctaLead}
        liens={[
          { href: route(lang, NAV.mgp), label: t.cta.report, primaire: true },
          { href: route(lang, NAV.contact), label: t.nav.contact },
        ]}
      />
    </div>
  );
}

function CarteProjet({
  projet,
  lang,
  comp,
}: {
  projet: ProjetVue;
  lang: "fr" | "en";
  comp?: { code: string; slug: string; color: string; titre: string };
}) {
  const pr = dict(lang).province;
  return (
    <RevealItem as="li" fade className="prov-projet" style={{ borderTopColor: comp?.color ?? "var(--c-30)" }}>
      <div className="prov-projet__haut mono">
        {comp ? (
          <Link href={compRoute(lang, comp.slug)} title={comp.titre}>{comp.code}</Link>
        ) : (
          projet.composante && <span>{projet.composante}</span>
        )}
        <span className="prov-projet__portee" data-local={projet.provinces.length > 0 || undefined}>
          {projet.provinces.length > 0 ? pr.porteeLocale : pr.portee}
        </span>
      </div>
      <h3>{projet.titre}</h3>
      {projet.resume && <p>{projet.resume}</p>}
      {projet.lieu && <p className="prov-projet__lieu">{projet.lieu}</p>}
      {projet.odd.length > 0 && (
        <ul className="prov-projet__odd" aria-label={pr.oddAria}>
          {projet.odd.map((n) => {
            const o = oddParNumero(n);
            return o ? (
              <li key={n} style={{ background: o.couleur }} title={`ODD ${n} · ${pick(o.titre, lang)}`}>
                {n}
              </li>
            ) : null;
          })}
        </ul>
      )}
    </RevealItem>
  );
}
