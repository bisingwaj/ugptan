/* Carte d'une composante — utilisée par l'index /components et par le pager.
   Cliquable dans son ensemble, teintée de la couleur de la composante. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import type { ComposanteVue } from "@/lib/projet/query";
import { compRoute } from "@/lib/routes";
import { compTintDe, onCompDe } from "@/lib/comp";

export function CompCard({ comp, lang }: { comp: ComposanteVue; lang: Lang }) {
  const t = dict(lang).comp;

  return (
    <Link href={compRoute(lang, comp.slug)} className="comp-card" style={compTintDe(comp.color)}>
      <div className="comp-card__top">
        <span className="mono comp-card__code" style={{ background: comp.color, color: onCompDe(comp.color) }}>
          {comp.code}
        </span>
        <span className="mono comp-card__montant">
          {comp.projets.length > 0 ? `${comp.projets.length} ${t.projets}` : t.noDotation}
        </span>
      </div>

      <h3 className="comp-card__titre">{comp.titre}</h3>
      <p className="comp-card__desc">{comp.soustitre}</p>

      <div className="comp-card__foot">
        <div className="comp-card__rule" style={{ background: comp.color }} />
        <div className="mono comp-card__meta">
          {comp.sous.length > 0 && <span>{comp.sous.length} {t.sousTitle.toLowerCase()}</span>}
          {comp.objectifs.length > 0 && <span>{comp.objectifs.length} {t.objectifsCount}</span>}
          <span className="comp-card__go">{t.see} →</span>
        </div>
      </div>
    </Link>
  );
}
