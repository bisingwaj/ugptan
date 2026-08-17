"use client";

/**
 * Sous-barre du module « Le projet » : ses trois écrans, dans l'ordre du menu
 * public.
 *
 * Elle double volontairement le dépliant de la barre latérale. Ce n'est pas une
 * redondance décorative : la barre latérale se replie en rail d'icônes et
 * devient un ruban horizontal sous 900 px, où le dépliant n'a pas sa place. La
 * sous-barre, elle, est toujours là — et surtout elle porte le CHAPÔ de l'écran
 * ouvert, ce qu'une entrée de menu ne peut pas faire.
 *
 * Composant client pour la seule raison qu'il lit le chemin courant : c'est lui
 * qui décide de l'onglet allumé, et le calculer à chaque page obligerait chaque
 * écran à se nommer lui-même.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_PROJET_ONGLETS } from "@/content/admin";
import { adminPath } from "@/lib/admin";

const BASE = adminPath("/project");

export function ProjetSubNav() {
  const pathname = usePathname();

  const onglets = ADMIN_PROJET_ONGLETS.map((onglet) => {
    const href = `${BASE}${onglet.slug}`;
    /* Égalité stricte pour le premier onglet, dont le chemin est celui du
       module : sans cela « La page du Projet » resterait allumée depuis les
       composantes et le cadre de résultats, qui vivent sous son chemin. */
    const actif = onglet.slug === ""
      ? pathname === BASE
      : pathname === href || pathname.startsWith(`${href}/`);
    return { ...onglet, href, actif };
  });

  const courant = onglets.find((onglet) => onglet.actif);

  return (
    <div className="adm-subnav">
      <nav className="adm-subnav__tabs" aria-label="Écrans du module">
        {onglets.map((onglet) => (
          <Link
            key={onglet.href}
            href={onglet.href}
            className={`adm-subnav__tab${onglet.actif ? " is-on" : ""}`}
            aria-current={onglet.actif ? "page" : undefined}
          >
            {onglet.label}
          </Link>
        ))}
      </nav>
      {/* Le chapô de l'écran ouvert, sous ses onglets : il dit ce qu'on
          administre ici, et ce qui se règle sur les deux autres. */}
      {courant && <p className="adm-subnav__hint">{courant.hint}</p>}
    </div>
  );
}
