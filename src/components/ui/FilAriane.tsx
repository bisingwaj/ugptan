/* Fil d'Ariane sémantique et cliquable.

   Il remplace la chaîne inerte que `PageHero` recevait jusqu'ici (« UGPTN / Le
   Projet »), pour trois raisons cumulées :

   · elle n'était pas cliquable, alors qu'un fil sert d'abord à remonter ;
   · « UGPTN » y désignait la racine du site, alors qu'une page `/ugptn` existe
     par ailleurs — d'où « UGPTN / L'UGPTN » sur cette page. La première maille
     est donc « Accueil », qui ne se confond avec aucune page de contenu ;
   · aucun `BreadcrumbList` n'était publié, alors que les moteurs s'en servent
     pour afficher le chemin sous le résultat.

   Composant serveur : le JSON-LD part avec le HTML, sans hydratation.
   L'habillage reste celui déjà écrit dans globals.css (`.page-hero__crumb`,
   `.comp-hero__crumb`), passé par `className` — aucun nouveau dessin. */
import Link from "next/link";
import { cn } from "@/lib/cn";
import { SITE_URL } from "@/lib/site";

/** Une maille du fil. Sans `href`, c'est la page courante : jamais un lien. */
export type Maille = { label: string; href?: string };

export function FilAriane({
  items,
  label,
  className,
}: {
  items: Maille[];
  /** Intitulé du repère de navigation, lu par les lecteurs d'écran (t.lbl.ariane). */
  label: string;
  /** Habillage de l'hôte. Par défaut celui du héros de page. */
  className?: string;
}) {
  /* Les mailles sans `href` ne portent pas d'`item` : schema.org admet une
     entrée sans URL pour la page courante, et forger une URL pour elle
     dupliquerait le canonical. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.label,
      ...(m.href ? { item: `${SITE_URL}${m.href}` } : {}),
    })),
  };

  return (
    <>
      <nav aria-label={label} className={cn("page-hero__crumb", className)}>
        <ol className="crumb">
          {items.map((m, i) => (
            <li key={`${m.label}-${i}`}>
              {i > 0 && <span aria-hidden>/</span>}
              {m.href ? (
                <Link href={m.href}>{m.label}</Link>
              ) : (
                <span aria-current="page">{m.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        // Sérialisation d'un objet que nous construisons : aucune chaîne
        // arbitraire n'y entre sans passer par JSON.stringify, qui échappe les
        // séquences dangereuses des valeurs.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
