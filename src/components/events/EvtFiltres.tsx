/* Filtres de catégorie du calendrier.

   Des LIENS, et non des boutons pilotés par un état client : le filtre entre
   alors dans l'URL, se partage, se met en favori, s'indexe, et fonctionne sans
   JavaScript. Même dispositif que les filtres des actualités, sur une autre
   nomenclature — les deux tables de catégories sont distinctes, et un composant
   commun aurait dû recevoir sa route en paramètre pour n'économiser que ce
   balisage-ci.

   Composant serveur : rien à hydrater. */
import Link from "next/link";
import type { EvtCategorie } from "@/lib/events/query";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";
import type { Lang } from "@/lib/pick";

type Props = {
  lang: Lang;
  categories: (EvtCategorie & { total: number })[];
  /** Slug de la catégorie active, `null` pour « Tout ». */
  active: string | null;
  /** Recherche en cours, conservée d'un filtre à l'autre. */
  recherche?: string | null;
};

function lien(lang: Lang, categorie: string | null, recherche?: string | null): string {
  const query = new URLSearchParams();
  if (categorie) query.set("categorie", categorie);
  if (recherche) query.set("q", recherche);
  const suffixe = query.toString();
  return `${route(lang, NAV.evenements)}${suffixe ? `?${suffixe}` : ""}`;
}

export function EvtFiltres({ lang, categories, active, recherche }: Props) {
  const t = dict(lang).evt;
  if (categories.length === 0) return null;

  return (
    <nav aria-label={t.filtresLabel} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
      <Link
        href={lien(lang, null, recherche)}
        className={active === null ? "chip chip--on" : "chip"}
        aria-current={active === null ? "true" : undefined}
      >
        {t.allFilter}
      </Link>

      {categories.map((categorie) => {
        const on = active === categorie.slug;
        return (
          <Link
            key={categorie.slug}
            href={lien(lang, categorie.slug, recherche)}
            className={on ? "chip chip--on" : "chip"}
            aria-current={on ? "true" : undefined}
            // La couleur de la catégorie prime sur l'accent générique une fois
            // le filtre actif : c'est le seul repère qui reste à l'écran.
            style={on && categorie.color ? { background: categorie.color, borderColor: categorie.color } : undefined}
          >
            {categorie.nom} <span className="mono" style={{ opacity: 0.7 }}>{categorie.total}</span>
          </Link>
        );
      })}
    </nav>
  );
}
