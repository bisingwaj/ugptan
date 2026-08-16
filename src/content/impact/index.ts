/* ============================================================================
   Contenu d'origine des sections administrables du site.

   Ce dossier joue DEUX rôles, et un seul à la fois :

     1. il AMORCE la base à la première ouverture du module dans la console
        (cf. src/lib/impact/bootstrap.ts) : la rédaction récupère l'existant au
        lieu de le ressaisir ;
     2. il sert de REPLI tant qu'aucune section n'est publiée pour un
        emplacement (cf. src/lib/impact/query.ts). Sans lui, une base neuve ou
        une console jamais ouverte videraient cinq pages publiques de leurs
        blocs — ce qui est exactement ce qu'on ne veut pas d'une mise en ligne.

   ⚠️ Dès qu'une section publiée existe pour un emplacement, c'est elle qui fait
   foi, et ce contenu n'est plus lu pour cet emplacement. Il n'est donc pas du
   contenu « codé en dur » : c'est l'état initial d'un contenu administrable.

   ─── Trois fichiers, un seul registre ────────────────────────────────────────
   Le découpage suit celui des écrans de la console (cf. `EMPLACEMENT_MODULE`
   dans lib/impact/statut.ts), et non celui des pages : un même fichier peut
   servir deux pages, et une page recevoir des sections de deux fichiers. C'est
   le cas de « Le projet », dont la frise des jalons appartient au module
   « Histoires & impact ».
   ========================================================================== */
import type { ImpactEmplacement } from "@/lib/impact/statut";
import type { ImpactSeedItem, ImpactSeedSection } from "./types";
import { histoiresSeed } from "./histoires";
import { ugptnSeed } from "./ugptn";
import { projetSeed } from "./projet";

export type {
  ImpactSeedEntete,
  ImpactSeedItem,
  ImpactSeedSection,
  ImpactSeedTextes,
} from "./types";

/** Toutes les sections d'origine, tous modules confondus. */
export const impactSeed: ImpactSeedSection[] = [...histoiresSeed, ...ugptnSeed, ...projetSeed];

/** Sections d'amorçage d'un emplacement donné, dans l'ordre d'affichage. */
export const seedPourEmplacement = (emplacement: ImpactEmplacement): ImpactSeedSection[] =>
  impactSeed.filter((s) => s.emplacement === emplacement).sort((a, b) => a.position - b.position);

/** Entrées effectives d'une section d'amorçage, reprise comprise. */
export function seedItems(section: ImpactSeedSection): ImpactSeedItem[] {
  const source = section.sourceKey
    ? impactSeed.find((s) => s.key === section.sourceKey)
    : section;
  const items = source?.items ?? [];
  return section.limite && section.limite > 0 ? items.slice(0, section.limite) : items;
}
