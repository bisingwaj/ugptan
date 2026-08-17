import { ProjetSubNav } from "@/components/dashboard/projet/ProjetSubNav";

/**
 * Coquille du module « Le projet » : ses trois écrans en sous-barre, au-dessus
 * de tout ce que le module affiche.
 *
 * Elle enveloppe aussi les pages de détail — la fiche d'une section, celle
 * d'une composante — et c'est voulu : on doit pouvoir passer des composantes au
 * cadre de résultats sans repasser par la liste.
 *
 * ⚠️ Aucun garde ici. Ce layout ne protège rien : l'App Router rend les pages en
 * parallèle des layouts, et chaque page du module appelle `requirePermission`
 * elle-même (cf. lib/auth/guard.ts).
 */
export default function ProjetModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProjetSubNav />
      {children}
    </>
  );
}
