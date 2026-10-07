import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { provinces } from "@/content/data";
import { NAV, route } from "@/lib/routes";
import { provinceRoute, slugProvince } from "@/lib/provinces/chemins";
import { resumesProvinces } from "@/lib/provinces/query";
import { PageHero } from "@/components/ui/PageHero";
import { FilAriane } from "@/components/ui/FilAriane";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { ProvinceMap } from "@/components/home/ProvinceMap";
import { metaPage } from "@/lib/seo";

/**
 * Index des provinces : la carte, puis les vingt-six pages province, les dix
 * prioritaires d'abord.
 *
 * Entrée du sous-menu « Le Projet » (cf. `NAV.provinces`). La table des
 * provinces et leur statut de priorité sont figés (cf. content/data.ts) ;
 * chaque carte y ajoute ce que la console publie — chef-lieu, population,
 * projets propres à la province — lu dans les caches des pages de détail, et
 * revalidé au même rythme qu'elles.
 */
export const revalidate = 120;
export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  return metaPage({ lang, path: NAV.provinces, title: t.province.indexTitre, description: t.province.indexMetaDesc });
}

const parNom = (a: { nom: string }, b: { nom: string }) => a.nom.localeCompare(b.nom, "fr");

export default async function ProvincesPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const pr = t.province;
  const resumes = await resumesProvinces(lang);
  const nombre = new Intl.NumberFormat(lang === "en" ? "en-GB" : "fr-FR", { notation: "compact", maximumFractionDigits: 1 });

  const groupes = [
    { cle: "prio", titre: pr.prioLabel, items: provinces.filter((p) => p.prio).sort(parNom) },
    { cle: "autres", titre: pr.autresLabel, items: provinces.filter((p) => !p.prio).sort(parNom) },
  ];

  return (
    <div>
      <PageHero
        crumb={
          <FilAriane
            label={t.lbl.ariane}
            items={[
              { label: t.nav.accueil, href: route(lang) },
              { label: t.nav.projet, href: route(lang, NAV.projet) },
              { label: t.nav.provinces },
            ]}
          />
        }
        title={pr.indexTitre}
        lead={t.home.couvertureLead}
      />

      {/* ===== CARTE ===== */}
      <section className="section" style={{ background: "var(--c-10)" }}>
        <div className="section__inner cols2 cols2--center" style={{ gridTemplateColumns: ".85fr 1.15fr" }}>
          {/* Texte depuis la gauche, puis la légende en cascade et l'aide en
              fondu ; la carte arrive en zoom arrière (ses provinces ont en plus
              leur propre entrée d'ouest en est, cf. ProvinceMap). */}
          <div>
            <Reveal variant="left">
              <Kicker>{t.sec.couverture}</Kicker>
              <h2 className="h2">26 {t.words.provinces}.<br />10 {t.words.prio}.</h2>
            </Reveal>
            <RevealGroup gap={0.1} delayChildren={0.2} style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 9, fontSize: 13 }}>
              <RevealItem style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden style={{ width: 11, height: 11, background: "var(--ac)" }} />
                <span style={{ color: "var(--c-80)" }}>{t.lbl.prio}</span>
              </RevealItem>
              <RevealItem style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden style={{ width: 11, height: 11, border: "1px solid var(--c-50)", background: "#fff" }} />
                <span style={{ color: "var(--c-80)" }}>{t.lbl.autres}</span>
              </RevealItem>
            </RevealGroup>
            <Reveal variant="fade" delay={0.3}>
              <p style={{ margin: "24px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--c-60)", maxWidth: 420 }}>{pr.carteAide}</p>
            </Reveal>
          </div>
          <Reveal variant="zoom" delay={0.1}>
            <ProvinceMap lang={lang} />
          </Reveal>
        </div>
      </section>

      {/* ===== LES 26 PROVINCES ===== */}
      <section className="section">
        <div className="section__inner">
          {groupes.map((groupe, rang) => (
            <div key={groupe.cle} style={{ marginTop: rang === 0 ? 0 : 48 }}>
              <Reveal>
                <Kicker>{groupe.titre}</Kicker>
              </Reveal>
              <RevealGroup as="ul" className="prov-cartes" gap={0.04}>
                {groupe.items.map((p) => {
                  const resume = resumes.get(slugProvince(p.nom));
                  const details = [
                    resume?.chefLieu,
                    resume?.population ? `${nombre.format(resume.population)} ${pr.habitants}` : null,
                  ].filter(Boolean);
                  return (
                    <RevealItem as="li" key={p.nom}>
                      <Link href={provinceRoute(lang, p.nom)} className="prov-carte" data-prio={p.prio || undefined}>
                        <span className="prov-carte__nom">
                          {p.nom}
                          {p.prio && <em className="sr-only"> ({pr.prio})</em>}
                        </span>
                        {details.length > 0 && <span className="prov-carte__details">{details.join(" · ")}</span>}
                        <span className="mono prov-carte__projets">
                          {resume?.projets
                            ? pr.projetsLocaux.replace("{n}", String(resume.projets))
                            : pr.projetsNationaux}
                          <span aria-hidden> →</span>
                        </span>
                      </Link>
                    </RevealItem>
                  );
                })}
              </RevealGroup>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
