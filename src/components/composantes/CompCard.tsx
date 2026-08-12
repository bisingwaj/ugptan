/* Carte d'une composante — utilisée par l'index /composantes et par le pager.
   Cliquable dans son ensemble, teintée de la couleur de la composante. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import type { Composante, ComposanteDetail } from "@/content/types";
import { compRoute } from "@/lib/routes";
import { compColor, compTint, onComp } from "@/lib/comp";

export function CompCard({
  comp,
  detail,
  lang,
}: {
  comp: Composante;
  detail?: ComposanteDetail;
  lang: Lang;
}) {
  const t = dict(lang).comp;
  const color = compColor(comp.code);

  return (
    <Link href={compRoute(lang, comp.code)} className="comp-card" style={compTint(comp.code)}>
      <div className="comp-card__top">
        <span className="mono comp-card__code" style={{ background: color, color: onComp(comp.code) }}>
          {comp.code}
        </span>
        <span className="mono comp-card__montant">
          {detail && detail.projets.length > 0 ? `${detail.projets.length} ${t.projets}` : t.noDotation}
        </span>
      </div>

      <h3 className="comp-card__titre">{pick(comp.titre, lang)}</h3>
      <p className="comp-card__desc">
        {detail ? pick(detail.soustitre, lang) : pick(comp.desc, lang)}
      </p>

      <div className="comp-card__foot">
        <div className="comp-card__rule" style={{ background: color }} />
        <div className="mono comp-card__meta">
          {comp.sous.length > 0 && <span>{comp.sous.length} {t.sousTitle.toLowerCase()}</span>}
          {detail && <span>{detail.objectifs.length} {t.objectifsCount}</span>}
          <span className="comp-card__go">{t.see} →</span>
        </div>
      </div>
    </Link>
  );
}
