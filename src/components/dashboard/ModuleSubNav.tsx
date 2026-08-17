"use client";

/**
 * Sous-barre d'un module qui compte plusieurs écrans : ses onglets, dans
 * l'ordre du menu public, et le chapô de celui qui est ouvert.
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
 *
 * Partagé par « Le Projet » et « L'UGPTN », qui ont le même besoin et doivent
 * s'apprendre une seule fois.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminPath } from "@/lib/admin";

/** Un écran du module. `slug` est relatif au module, vide pour le premier. */
export type ModuleOnglet = {
  readonly slug: string;
  readonly label: string;
  readonly hint: string;
};

export function ModuleSubNav({
  base,
  onglets,
  libelle,
}: {
  /** Chemin du module, relatif à la console (« /project »). */
  base: string;
  onglets: readonly ModuleOnglet[];
  /** Nom du module, pour l'étiquette accessible de la navigation. */
  libelle: string;
}) {
  const pathname = usePathname();
  const racine = adminPath(base);

  const liens = onglets.map((onglet) => {
    const href = `${racine}${onglet.slug}`;
    /* Égalité stricte pour le premier onglet, dont le chemin est celui du
       module : sans cela, il resterait allumé depuis les écrans suivants, qui
       vivent sous son chemin. */
    const actif = onglet.slug === ""
      ? pathname === racine
      : pathname === href || pathname.startsWith(`${href}/`);
    return { ...onglet, href, actif };
  });

  const courant = liens.find((lien) => lien.actif);

  return (
    <div className="adm-subnav">
      <nav className="adm-subnav__tabs" aria-label={`${libelle} — écrans du module`}>
        {liens.map((lien) => (
          <Link
            key={lien.href}
            href={lien.href}
            className={`adm-subnav__tab${lien.actif ? " is-on" : ""}`}
            aria-current={lien.actif ? "page" : undefined}
          >
            {lien.label}
          </Link>
        ))}
      </nav>
      {/* Le chapô de l'écran ouvert, sous ses onglets : il dit ce qu'on
          administre ici, et donc ce qui se règle sur les autres. */}
      {courant && <p className="adm-subnav__hint">{courant.hint}</p>}
    </div>
  );
}
