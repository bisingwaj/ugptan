/* Carte d'un organe de gouvernance (COPIL, CTP, UGPTN).

   Le bloc était écrit deux fois : sur l'accueil avec trois attributs, sur
   « Gouvernance » avec quatre. Le lecteur qui suivait le lien « en savoir
   plus » retrouvait donc les mêmes cartes, à une ligne près.

   Le partage est désormais explicite : l'accueil dit que trois organes
   existent et de quelle nature ils sont ; « Gouvernance » dit qui préside, à
   quelle majorité et à quelle fréquence. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import type { GouvBody } from "@/content/types";

export function CarteOrgane({
  organe,
  lang,
  champs,
  lien,
}: {
  organe: GouvBody;
  lang: Lang;
  champs: "court" | "complet";
  /** Renvoi propre à un organe, rendu en pied de carte. Il vit ici et non chez
      l'appelant : placé après la carte, il tombait hors de la cellule, que
      `.cell` rogne. */
  lien?: { href: string; label: string };
}) {
  const g = dict(lang).gouv;
  const lignes: [string, string][] =
    champs === "complet"
      ? [
          [g.bodyLabels.nature, pick(organe.nature, lang)],
          [g.bodyLabels.presidence, pick(organe.presidence, lang)],
          [g.bodyLabels.decision, pick(organe.decision, lang)],
          [g.bodyLabels.frequence, pick(organe.frequence, lang)],
        ]
      : [[g.bodyLabels.nature, pick(organe.nature, lang)]];

  return (
    <div className={champs === "complet" ? "organe organe--complet" : "organe"}>
      <div className="organe__head">
        <span className="organe__sigle">{organe.sigle}</span>
        <span className="mono organe__effectif">{pick(organe.effectif, lang)}</span>
      </div>
      <div className="organe__nom">{pick(organe.nom, lang)}</div>
      <dl className="organe__attrs">
        {lignes.map(([k, v]) => (
          <div key={k}>
            <dt className="mono organe__k">{k}</dt>
            <dd className="organe__v">{v}</dd>
          </div>
        ))}
      </dl>
      {lien && (
        <Link href={lien.href} className="mono organe__lien">
          {lien.label} <span className="arrow">→</span>
        </Link>
      )}
    </div>
  );
}
