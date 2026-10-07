/* Questions & réponses — les deux foires aux questions du site.

   Le dessin appartient à `components/ui/Accordion.tsx`, composant client déjà
   employé par les pages « L'UGPTN » et « Le projet » : ce bloc ne fait que lui
   passer les entrées de la section, dans leur ordre de saisie.

   Une entrée sans question ni réponse est écartée plutôt que rendue vide : un
   accordéon qui se déplie sur rien ressemble à une panne. */
import type { ImpactItemVue } from "@/lib/impact/query";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/motion/Reveal";

export function BlocFaq({ items }: { items: ImpactItemVue[] }) {
  const questions = items
    .filter((item) => item.titre && item.texte)
    .map((item) => ({ q: item.titre as string, r: item.texte as string }));

  if (questions.length === 0) return null;

  /* L'accordéon suit son en-tête (déjà révélé par le rendu commun) avec un
     léger retard : les questions arrivent après le titre qui les annonce. */
  return (
    <Reveal delay={0.08}>
      <Accordion items={questions} />
    </Reveal>
  );
}
