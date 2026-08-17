import { ADMIN_UGPTN_ONGLETS } from "@/content/admin";
import { ModuleSubNav } from "@/components/dashboard/ModuleSubNav";

/**
 * Coquille du module « L'UGPTN » : ses deux écrans en sous-barre, au-dessus de
 * tout ce que le module affiche.
 *
 * Elle enveloppe aussi les pages de détail — la fiche d'une section de la page
 * « L'Unité » — pour qu'on puisse passer à la gouvernance sans repasser par la
 * liste.
 *
 * ⚠️ Aucun garde ici. Ce layout ne protège rien : l'App Router rend les pages en
 * parallèle des layouts, et chaque page du module appelle `requirePermission`
 * elle-même (cf. lib/auth/guard.ts).
 */
export default function UgptnModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleSubNav base="/ugptn" onglets={ADMIN_UGPTN_ONGLETS} libelle="L'UGPTN" />
      {children}
    </>
  );
}
