import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { provinces } from "@/content/data";
import { NAV, route } from "@/lib/routes";
import { provinceRoute } from "@/lib/provinces/chemins";
import { PageHero } from "@/components/ui/PageHero";
import { FilAriane } from "@/components/ui/FilAriane";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { ProvinceMap } from "@/components/home/ProvinceMap";

/**
 * Index des provinces : la carte, puis les vingt-six pages province, les dix
 * prioritaires d'abord.
 *
 * Entrée du sous-menu « Le Projet » (cf. `NAV.provinces`). Rien n'y est lu en
 * base : la table des provinces et leur statut de priorité sont figés
 * (cf. content/data.ts), la page est donc entièrement statique. Ce que la
 * console administre (fiches, projets) vit sur les pages de détail.
 */
export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const pr = dict(lang).province;
  const path = `/${lang}${NAV.provinces}`;
  return {
    title: pr.indexTitre,
    description: pr.indexMetaDesc,
    alternates: {
      canonical: path,
      languages: { fr: `/fr${NAV.provinces}`, en: `/en${NAV.provinces}` },
    },
    openGraph: { title: pr.indexTitre, description: pr.indexMetaDesc, url: path, type: "website" },
  };
}

const parNom = (a: { nom: string }, b: { nom: string }) => a.nom.localeCompare(b.nom, "fr");

export default async function ProvincesPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const pr = t.province;

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
          <Reveal>
            <Kicker>{t.sec.couverture}</Kicker>
            <h2 className="h2">26 {t.words.provinces}.<br />10 {t.words.prio}.</h2>
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 9, fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden style={{ width: 11, height: 11, background: "var(--ac)" }} />
                <span style={{ color: "var(--c-80)" }}>{t.lbl.prio}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden style={{ width: 11, height: 11, border: "1px solid var(--c-50)", background: "#fff" }} />
                <span style={{ color: "var(--c-80)" }}>{t.lbl.autres}</span>
              </div>
            </div>
            <p style={{ margin: "24px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--c-60)", maxWidth: 420 }}>{pr.carteAide}</p>
          </Reveal>
          <ProvinceMap lang={lang} />
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
              <ul className="prov-liste">
                {groupe.items.map((p) => (
                  <li key={p.nom}>
                    <Link href={provinceRoute(lang, p.nom)}>
                      <span aria-hidden data-prio={p.prio || undefined} />
                      {p.nom}
                      {p.prio && <em className="sr-only"> ({pr.prio})</em>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
