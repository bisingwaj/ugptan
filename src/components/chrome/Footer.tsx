import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { meta } from "@/content/data";
import { contact } from "@/content/carbon";
import { NAV, NAV_FOOTER, NAV_LEGAL, route } from "@/lib/routes";

const colLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase",
  letterSpacing: "0.1em", color: "var(--c-60)", marginBottom: 16,
};
const colLink: React.CSSProperties = { display: "block", padding: "7px 0", fontSize: 14, color: "var(--c-30)" };

export function Footer({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <footer style={{ background: "var(--c-black)", color: "var(--c-30)" }}>
      <div className="footer-grid" style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "clamp(54px,7vw,88px) var(--pad-x) 40px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "clamp(28px,4vw,56px)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span style={{ width: 30, height: 30, background: "var(--ac)", position: "relative", display: "inline-flex" }}>
              <span style={{ position: "absolute", right: 5, bottom: 5, width: 11, height: 11, background: "var(--c-black)" }} />
            </span>
            <span style={{ fontWeight: 700, fontSize: 19, color: "#fff" }}>UGPTN</span>
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--c-50)", maxWidth: 300 }}>{meta.uniteLong}</p>
          <p className="mono" style={{ margin: "16px 0 0", fontSize: 11.5, color: "var(--c-60)", lineHeight: 1.7 }}>{meta.tutelleLong}<br />{meta.bailleurs}</p>
          <p className="mono" style={{ margin: "12px 0 0", fontSize: 11, color: "var(--c-50)", lineHeight: 1.6, maxWidth: 320 }}>{t.foot.source}</p>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 7, fontSize: 13, color: "var(--c-30)", lineHeight: 1.5 }}>
            <span>{contact.adresse}</span>
            <span style={{ color: "var(--c-50)" }}>{contact.quartier}</span>
            <a href={`tel:${contact.tel.replace(/\s/g, "")}`} style={{ color: "var(--c-30)" }}>{contact.tel}</a>
            <a href={`mailto:${contact.email}`} style={{ color: "var(--ac-light)" }}>{contact.email}</a>
          </div>
        </div>

        <div>
          <div style={colLabel}>{t.words.navigation}</div>
          {NAV_FOOTER.map((item) => (
            <Link key={item.key} href={route(lang, item.slug)} style={colLink}>{t.nav[item.key]}</Link>
          ))}
        </div>

        <div>
          <div style={colLabel}>{t.foot.transparence}</div>
          <Link href={route(lang, NAV.transparence)} style={colLink}>{t.cta.docs}</Link>
          <Link href={route(lang, NAV.marches)} style={colLink}>{t.cta.marches}</Link>
          <Link href={route(lang, NAV.ressources)} style={colLink}>{t.words.ressources}</Link>
        </div>

        <div>
          <div style={colLabel}>{t.words.redevabilite}</div>
          <Link href={route(lang, NAV.mgp)} style={colLink}>{t.cta.mgp}</Link>
          <Link href={route(lang, NAV.mgp)} style={colLink}>MGP-EAS/HS</Link>
          <Link href={route(lang, NAV.contact)} style={{ ...colLink, color: "var(--ac-light)", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="blink" style={{ width: 7, height: 7, background: "var(--green-bright)", borderRadius: "50%" }} />{t.contact.numeroVert}
          </Link>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--c-80)" }}>
        <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "18px var(--pad-x)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--c-60)" }}>
          <span>© {t.words.year} UGPTN · {meta.code} · {meta.ville}</span>
          <nav className="footer-legal" aria-label={t.foot.legalLabel}>
            {NAV_LEGAL.map((item) => (
              <Link key={item.key} href={route(lang, item.slug)} className="footer-legal__link">
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
