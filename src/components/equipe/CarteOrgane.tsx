/* Carte d'un organe de gouvernance (COPIL, CTP, UGPTN).

   Le bloc était écrit deux fois : sur l'accueil avec trois attributs, sur
   « Gouvernance » avec quatre. Le lecteur qui suivait le lien « en savoir
   plus » retrouvait donc les mêmes cartes, à une ligne près.

   Le partage est désormais explicite : l'accueil dit que trois organes
   existent et de quelle nature ils sont ; « Gouvernance » dit qui préside, à
   quelle majorité et à quelle fréquence.

   ⚠️ Une ligne dont la valeur n'est pas renseignée DISPARAÎT, au lieu de rester
   vide en face de son intitulé. Un organe peut n'avoir ni règle de majorité ni
   périodicité arrêtée, et depuis que la console tient ces attributs, c'est un
   état atteignable. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import type { OrganeVue } from "@/lib/gouvernance/query";

export function CarteOrgane({
  organe,
  lang,
  champs,
  lien,
}: {
  organe: OrganeVue;
  lang: Lang;
  champs: "court" | "complet";
  /** Renvoi propre à un organe, rendu en pied de carte. Il vit ici et non chez
      l'appelant : placé après la carte, il tombait hors de la cellule, que
      `.cell` rogne. */
  lien?: { href: string; label: string };
}) {
  const g = dict(lang).gouv;
  const toutes: [string, string | null][] =
    champs === "complet"
      ? [
          [g.bodyLabels.nature, organe.nature],
          [g.bodyLabels.presidence, organe.presidence],
          [g.bodyLabels.decision, organe.decision],
          [g.bodyLabels.frequence, organe.frequence],
        ]
      : [[g.bodyLabels.nature, organe.nature]];

  const lignes = toutes.filter((ligne): ligne is [string, string] => Boolean(ligne[1]));

  return (
    <div className={champs === "complet" ? "organe organe--complet" : "organe"}>
      <div className="organe__head">
        <span className="organe__sigle">{organe.sigle}</span>
        {organe.effectif && <span className="mono organe__effectif">{organe.effectif}</span>}
      </div>
      <div className="organe__nom">{organe.nom}</div>
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
