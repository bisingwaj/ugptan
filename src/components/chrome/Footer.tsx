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
/* `.footer-link` ne porte aucun style sur desktop : elle sert de prise à la
   règle mobile qui donne à ces liens une hauteur tactile (cf. globals.css). */
const colLabel = "mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-c-60";
const colLink = "footer-link block py-[7px] text-[14px] text-c-30 transition-colors duration-200 hover:text-white";
const colLinkAccent = "footer-link flex items-center gap-2 py-[7px] text-[14px] text-ac-light transition-colors duration-200 hover:text-white";

export function Footer({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <footer className="bg-c-black text-c-30">
      <div className="footer-grid mx-auto grid max-w-(--maxw) grid-cols-[1.6fr_repeat(4,1fr)] gap-x-[clamp(24px,3vw,48px)] gap-y-[clamp(32px,4vw,44px)] px-(--pad-x) pt-[clamp(54px,7vw,88px)] pb-10">
        <div className="footer-brand">
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

        {/* Une colonne par groupe de la navigation : le pied de page expose
            l'arbre complet, y compris les pages absentes de la barre. */}
        {NAV_FOOTER.map((group) => (
          <nav key={group.key} aria-label={t.nav[group.labelKey]}>
            <div className={colLabel}>{t.nav[group.labelKey]}</div>
            {group.children.map((item) => (
              <Link key={item.key} href={route(lang, item.slug)} className={colLink}>
                {t.navSub[item.key] ?? t.nav[item.key]}
              </Link>
            ))}
            {/* Le numéro vert accompagne le mécanisme de gestion des plaintes,
                seul canal du pied de page ouvert 24h/24. */}
            {group.key === "gtransparence" && (
              <Link href={route(lang, NAV.mgp)} className={colLinkAccent}>
                <span className="blink size-[7px] rounded-full bg-green-bright" />{t.contact.numeroVert}
              </Link>
            )}
          </nav>
        ))}
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
