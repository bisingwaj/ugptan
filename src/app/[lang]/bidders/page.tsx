import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";
import { DIGIPROCURE_URL } from "@/lib/external";
import { PageHero } from "@/components/ui/PageHero";
import { Kicker } from "@/components/ui/Kicker";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang).soumissionner;
  const title = dict(lang).nav.soumissionnaires;
  const description = t.heroLead;
  const path = route(lang, NAV.soumissionnaires);

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { fr: `/fr${NAV.soumissionnaires}`, en: `/en${NAV.soumissionnaires}` },
    },
    openGraph: { title, description, url: path, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

const ICONES: IconName[] = ["compte", "dossier", "depot", "attribution"];

/**
 * La porte des entreprises candidates.
 *
 * ─── Pourquoi aucun formulaire ici ───────────────────────────────────────────
 *
 * Le compte se crée sur DigiProcure, et cette page n'en héberge pas la saisie.
 * Ce n'est pas un raccourci : les comptes, les sessions, les règles de mot de
 * passe, le lien de confirmation et le dépôt des offres vivent tous là-bas.
 * Un formulaire posé ici ferait naître la session sur un autre domaine que
 * celui où l'on se trouve, obligerait à y renvoyer le visiteur dès la première
 * confirmation, et dupliquerait des règles de validation qui décident de la
 * recevabilité d'une offre. Deux jeux de règles pour une même chose finissent
 * toujours par diverger, et ici une divergence signifie qu'une entreprise ne
 * peut pas déposer.
 *
 * Ce que cette page doit faire, elle le fait : dire le parcours en entier, dire
 * ce qui est gratuit, et ouvrir la bonne porte.
 */
export default async function SoumissionnairesPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const d = dict(lang);
  const t = d.soumissionner;

  /* ⚠️ `DIGIPROCURE_URL` vaut `null` tant que l'adresse n'est pas configurée.
     Un bouton mort sur le site institutionnel d'une unité de gestion de projet
     se lit comme une panne ; une phrase qui annonce l'ouverture se lit comme
     une information. Même règle que le bandeau de navigation. */
  const plateforme = DIGIPROCURE_URL;

  const etapes = [
    { titre: t.etape1Titre, texte: t.etape1Texte, aVenir: false },
    { titre: t.etape2Titre, texte: t.etape2Texte, aVenir: false },
    { titre: t.etape3Titre, texte: t.etape3Texte, aVenir: false },
    { titre: t.etape4Titre, texte: t.etape4Texte, aVenir: true },
  ];

  const reserves = [t.reserve1, t.reserve2, t.reserve3];

  return (
    <div>
      <PageHero
        crumb={`UGPTN / ${d.nav.soumissionnaires}`}
        title={t.heroTitle}
        lead={t.heroLead}
      >
        <Reveal
          variant="up"
          delay={0.18}
          style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 30 }}
        >
          {plateforme ? (
            <>
              <a
                href={`${plateforme}/sign-up`}
                className="btn btn--primary"
                style={{ padding: "15px 26px" }}
              >
                {t.ctaCreer} →
              </a>
              <a
                href={`${plateforme}/sign-in`}
                className="btn"
                style={{ padding: "15px 26px" }}
              >
                {t.ctaConnexion}
              </a>
            </>
          ) : (
            <p
              style={{
                margin: 0,
                maxWidth: "62ch",
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "var(--c-70)",
                borderLeft: "3px solid var(--c-30)",
                paddingLeft: 14,
              }}
            >
              {t.bientot}
            </p>
          )}
          <Link
            href={route(lang, NAV.marches)}
            className="btn"
            style={{ padding: "15px 26px" }}
          >
            {t.ctaAvis}
          </Link>
        </Reveal>
      </PageHero>

      <section
        style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}
      >
        <div className="section__inner">
          <Reveal>
            <Kicker>{t.etapesKicker}</Kicker>
            <h2
              style={{
                margin: "6px 0 0",
                fontWeight: 600,
                fontSize: "clamp(22px,2.6vw,32px)",
                letterSpacing: "-0.02em",
              }}
            >
              {t.etapesTitre}
            </h2>
          </Reveal>

          <RevealGroup className="grid-4" style={{ marginTop: 26 }} gap={0.045}>
            {etapes.map((e, i) => (
              <RevealItem
                key={e.titre}
                className="cell step-card"
                style={{
                  padding: "26px 22px",
                  minHeight: 210,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="step-card__head">
                  <span className="step-card__icon">
                    <Icon name={ICONES[i]!} size={26} />
                  </span>
                  <span className="mono step-card__n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3
                  style={{
                    margin: "16px 0 0",
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {e.titre}
                  {/* Le dépôt en ligne n'existe pas encore. Le taire ferait
                      croire qu'il est disponible ; le dire ici évite qu'une
                      entreprise attende une fonction qui n'ouvrira qu'au lot
                      suivant. */}
                  {e.aVenir && (
                    <span
                      className="mono"
                      style={{
                        marginLeft: 8,
                        fontSize: 10.5,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--c-60)",
                        border: "1px solid var(--c-20)",
                        padding: "2px 6px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.aVenir}
                    </span>
                  )}
                </h3>
                <p
                  style={{
                    margin: "9px 0 0",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: "var(--c-60)",
                  }}
                >
                  {e.texte}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal style={{ marginTop: "clamp(48px,6vw,80px)" }}>
            <Kicker>{t.reserveKicker}</Kicker>
            <h2
              style={{
                margin: "6px 0 20px",
                fontWeight: 600,
                fontSize: "clamp(20px,2.4vw,28px)",
                letterSpacing: "-0.02em",
              }}
            >
              {t.reserveTitre}
            </h2>
          </Reveal>

          <RevealGroup className="grid-3" gap={0.045}>
            {reserves.map((r, i) => (
              <RevealItem
                key={r}
                className="cell"
                style={{ padding: "24px 22px", display: "flex", gap: 14 }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 12, color: "var(--ac)", fontWeight: 600 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: "var(--c-70)",
                  }}
                >
                  {r}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </div>
  );
}
