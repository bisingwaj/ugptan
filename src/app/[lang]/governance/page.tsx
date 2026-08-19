import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { activitesPubliees, organesPublies } from "@/lib/gouvernance/query";
import { membresEnAvant } from "@/lib/equipe/query";
import { NAV, route } from "@/lib/routes";
import { Kicker } from "@/components/ui/Kicker";
import { PageHero } from "@/components/ui/PageHero";
import { FilAriane } from "@/components/ui/FilAriane";
import { CtaFin } from "@/components/ui/CtaFin";
import { CarteOrgane } from "@/components/equipe/CarteOrgane";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { CartesCoordination } from "@/components/equipe/CartesCoordination";

/** Cache aligné sur les autres pages administrées : les organes et la chronique
 *  viennent de la console, les cartes de coordination du module « L'équipe ».
 *  Les écritures des deux modules l'invalident (cf. lib/gouvernance/cache.ts,
 *  lib/equipe/cache.ts). */
export const revalidate = 120;

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const g = dict(lang).gouv;
  const path = `/${lang}${NAV.gouvernance}`;
  return {
    title: g.titre,
    description: g.metaDesc,
    alternates: {
      canonical: path,
      languages: { fr: `/fr${NAV.gouvernance}`, en: `/en${NAV.gouvernance}` },
    },
    openGraph: { title: g.titre, description: g.metaDesc, url: path, type: "website" },
  };
}

export default async function GouvernancePage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const g = t.gouv;

  // Trois lectures indépendantes, menées de front : aucune ne conditionne les
  // autres, et les enchaîner ajouterait deux allers-retours à la base pour rien.
  const [organes, activites, leads] = await Promise.all([
    organesPublies(lang),
    activitesPubliees(lang),
    membresEnAvant(lang),
  ]);

  /* La section « Composition » ne nomme plus COPIL et CTP en toutes lettres :
     elle affiche les organes qui ont une composition rédigée. C'est ce qui
     permet d'en ajouter un troisième depuis la console — la page d'origine
     appelait les deux siens par leur nom, et n'en aurait pas montré d'autre. */
  const composes = organes.filter((organe) => organe.composition);

  return (
    <div>
      <PageHero
        crumb={
          <FilAriane
            label={t.lbl.ariane}
            items={[
              { label: t.nav.accueil, href: route(lang) },
              { label: t.nav.ugptn, href: route(lang, NAV.ugptn) },
              { label: g.titre },
            ]}
          />
        }
        title={g.titre}
        lead={g.lead}
      />

      {/* ===== LES ORGANES ================================================
          Version complète : présidence, règle de décision et fréquence. C'est
          ce que l'aperçu de l'accueil ne dit pas, et la raison de venir ici.

          Chaque bande s'efface si elle n'a rien à porter, plutôt que d'ouvrir
          un titre suivi d'une grille vide. */}
      {organes.length > 0 && (
      <section className="section">
        <div className="section__inner">
          <Reveal>
            <Kicker>{g.bodiesLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 40px" }}>{g.bodiesTitle}</h2>
          </Reveal>
          <RevealGroup className="grid-3 celled--top" gap={0.05}>
            {organes.map((b) => (
              <RevealItem key={b.id} className="cell organe-cell">
                {/* L'Unité a sa propre page : on referme la boucle entre les
                    deux entrées du groupe de navigation. */}
                <CarteOrgane
                  organe={b}
                  lang={lang}
                  champs="complet"
                  lien={b.sigle === "UGPTN" ? { href: route(lang, NAV.ugptn), label: t.cta.voirUnite } : undefined}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
      )}

      {/* ===== COMPOSITION =============================================== */}
      {composes.length > 0 && (
      <section className="section section--grey">
        <div className="section__inner">
          <Reveal>
            <Kicker>{g.compLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 40px" }}>{g.compTitle}</h2>
          </Reveal>
          <RevealGroup className="cols2" gap={0.05} style={{ gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
            {composes.map((organe) => (
              <RevealItem key={organe.id} style={{ background: "#fff", padding: "34px clamp(20px,3vw,38px)" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{organe.sigle}</h3>
                  {/* L'effectif n'est plus rédigé deux fois : la carte et cette
                      ligne le tirent du même champ, préfixé de l'intitulé de
                      section. */}
                  {organe.effectif && (
                    <span className="mono" style={{ fontSize: 11, color: "var(--ac)" }}>
                      {g.compLabel} — {organe.effectif}
                    </span>
                  )}
                </div>
                <p style={{ margin: "12px 0 22px", fontSize: 14, color: "var(--c-70)", lineHeight: 1.5 }}>{organe.composition}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {organe.membres.map((m) => <span key={m} style={{ fontSize: 12.5, color: "var(--c-black)", background: "var(--c-10)", border: "1px solid var(--c-20)", padding: "7px 12px" }}>{m}</span>)}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
      )}

      {/* ===== CHRONIQUE ==================================================
          Seule section du site rendue sans apparition au défilement : l'écart
          se voyait en scrollant. */}
      {activites.length > 0 && (
      <section className="section section--dark">
        <div className="section__inner">
          <Reveal>
            <Kicker light>{g.actLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 14px" }}>{g.actTitle}</h2>
            <p style={{ margin: "0 0 44px", fontSize: 16, lineHeight: 1.6, color: "var(--c-40)", maxWidth: 680 }}>{g.actLead}</p>
          </Reveal>
          <RevealGroup gap={0.045} style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--c-80)", border: "1px solid var(--c-80)" }}>
            {activites.map((a) => (
              <RevealItem key={a.id} className="gov-act" style={{ background: "var(--c-black)", padding: "24px clamp(20px,2.4vw,30px)", display: "grid", gridTemplateColumns: "150px 1fr", gap: "clamp(14px,2vw,32px)", alignItems: "start", borderLeft: `3px solid ${a.color}` }}>
                <div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--c-50)" }}>{a.dateLabel}</div>
                  <span className="mono" style={{ display: "inline-block", marginTop: 10, fontSize: 10.5, fontWeight: 600, color: "#fff", background: a.color, padding: "4px 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{a.org}</span>
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", lineHeight: 1.35 }}>{a.titre}</div>
                  <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--c-40)" }}>{a.note}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
      )}

      {/* ===== QUI RÉPOND DE QUOI ========================================
          Ce n'est pas un troisième affichage de l'équipe : c'est le seul
          endroit qui rattache une personne à un mandat. Le lien dit désormais
          où trouver le reste, ce qui manquait. */}
      <section className="section">
        <div className="section__inner">
          <Reveal style={{ maxWidth: 640, marginBottom: 42 }}>
            <Kicker>{g.leadsLabel}</Kicker>
            <h2 className="h2--sm" style={{ marginBottom: 14 }}>{g.leadsTitle}</h2>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "var(--c-70)" }}>{g.leadsLead}</p>
          </Reveal>
          <CartesCoordination membres={leads} />
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Link href={route(lang, NAV.ugptn)} className="mono" style={{ fontSize: 13, color: "var(--ac)", display: "inline-flex", alignItems: "center", gap: 8 }}>
              {t.cta.toutEquipe} →
            </Link>
          </div>
        </div>
      </section>

      <CtaFin
        titre={g.ctaTitle}
        lead={g.ctaLead}
        liens={[
          { href: route(lang, NAV.transparence), label: t.nav.transparence },
          { href: route(lang, NAV.marches), label: t.cta.marches },
          { href: route(lang, NAV.contact), label: t.nav.contact },
        ]}
      />
    </div>
  );
}
