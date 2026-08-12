import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { meta } from "@/content/data";
import { contact } from "@/content/carbon";
import { NAV, NAV_FOOTER, NAV_LEGAL, route } from "@/lib/routes";

/* Classes partagées des colonnes. Volontairement déclinées en variantes
   complètes plutôt que composées par surcharge : deux utilitaires de même
   propriété (block/flex, text-c-30/text-ac-light) sont départagés par l'ordre
   de la feuille compilée, pas par l'ordre dans la chaîne de classes. */
const colLabel = "mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-c-60";
const colLink = "block py-[7px] text-[14px] text-c-30";
const colLinkAccent = "flex items-center gap-2 py-[7px] text-[14px] text-ac-light";

export function Footer({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <footer className="bg-c-black text-c-30">
      <div className="footer-grid mx-auto grid max-w-(--maxw) grid-cols-[1.5fr_1fr_1fr_1fr] gap-[clamp(28px,4vw,56px)] px-(--pad-x) pt-[clamp(54px,7vw,88px)] pb-10">
        <div>
          <div className="mb-[18px] flex items-center gap-3">
            <span className="relative inline-flex size-[30px] bg-ac">
              <span className="absolute right-[5px] bottom-[5px] size-[11px] bg-c-black" />
            </span>
            <span className="text-[19px] font-bold text-white">UGPTN</span>
          </div>
          <p className="max-w-[300px] text-[13.5px] leading-[1.6] text-c-50">{meta.uniteLong}</p>
          <p className="mt-4 font-mono text-[11.5px] leading-[1.7] text-c-60">{meta.tutelleLong}<br />{meta.bailleurs}</p>
          <p className="mt-3 max-w-[320px] font-mono text-[11px] leading-[1.6] text-c-50">{t.foot.source}</p>
          <div className="mt-5 flex flex-col gap-[7px] text-[13px] leading-[1.5] text-c-30">
            <span>{contact.adresse}</span>
            <span className="text-c-50">{contact.quartier}</span>
            <a href={`tel:${contact.tel.replace(/\s/g, "")}`} className="text-c-30">{contact.tel}</a>
            <a href={`mailto:${contact.email}`} className="text-ac-light">{contact.email}</a>
          </div>
        </div>

        <div>
          <div className={colLabel}>{t.words.navigation}</div>
          {NAV_FOOTER.map((item) => (
            <Link key={item.key} href={route(lang, item.slug)} className={colLink}>{t.nav[item.key]}</Link>
          ))}
        </div>

        <div>
          <div className={colLabel}>{t.foot.transparence}</div>
          <Link href={route(lang, NAV.transparence)} className={colLink}>{t.cta.docs}</Link>
          <Link href={route(lang, NAV.marches)} className={colLink}>{t.cta.marches}</Link>
          <Link href={route(lang, NAV.ressources)} className={colLink}>{t.words.ressources}</Link>
        </div>

        <div>
          <div className={colLabel}>{t.words.redevabilite}</div>
          <Link href={route(lang, NAV.mgp)} className={colLink}>{t.cta.mgp}</Link>
          <Link href={route(lang, NAV.mgp)} className={colLink}>MGP-EAS/HS</Link>
          <Link href={route(lang, NAV.contact)} className={colLinkAccent}>
            <span className="blink size-[7px] rounded-full bg-green-bright" />{t.contact.numeroVert}
          </Link>
        </div>
      </div>

      <div className="border-t border-c-80">
        <div className="mx-auto flex max-w-(--maxw) flex-wrap justify-between gap-3 px-(--pad-x) py-[18px] font-mono text-[11px] text-c-60">
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
