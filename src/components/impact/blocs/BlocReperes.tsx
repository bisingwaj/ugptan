/* Bandeau de repères — les trois chiffres qui coiffent l'organisation interne.

   Balisage repris de `app/[lang]/ugptn/page.tsx` : la grille `.unite-reperes`
   porte elle-même ses filets et sa marge basse, les cellules n'ont que leur
   valeur et son libellé.

   ⚠️ Ces chiffres étaient DÉRIVÉS des tables du site — le nombre de pôles, le
   nombre d'organes de gouvernance, l'année de l'arrêté. Ils sont désormais
   saisis, donc susceptibles de mentir : la page affiche ce qu'on y écrit. C'est
   le prix de leur mise en console, et il est assumé — un chiffre calculé ne
   pouvait pas non plus être corrigé quand la table, elle, était fausse. */
import type { ImpactItemVue } from "@/lib/impact/query";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function BlocReperes({ items }: { items: ImpactItemVue[] }) {
  return (
    <RevealGroup className="unite-reperes" gap={0.045}>
      {items.map((item) => (
        <RevealItem key={item.id} className="cell unite-repere">
          <div className="mono unite-repere__v">{item.valeur}</div>
          <div className="unite-repere__l">{item.titre}</div>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
