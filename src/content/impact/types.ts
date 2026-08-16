/* ============================================================================
   Forme du contenu d'origine des sections administrables.

   Ces types décrivent ce qu'une section vaut AVANT toute intervention de la
   rédaction : ils servent à l'amorçage de la base et au repli des pages
   publiques (cf. l'en-tête de `index.ts`). Ils ne décrivent pas la base — les
   colonnes vivent dans `prisma/schema.prisma` — mais la saisie d'origine, d'où
   les champs facultatifs partout : un jalon n'a pas de titre, une citation n'a
   pas d'entrées, un repère n'a pas de couleur.
   ========================================================================== */
import type { ImgKey } from "../types";
import type { ImpactEmplacement, ImpactLayout, ImpactTheme } from "@/lib/impact/statut";

/** Textes d'une entrée dans une langue. */
export type ImpactSeedTextes = {
  surtitre?: string;
  titre?: string;
  texte?: string;
  texteSecondaire?: string;
  mediaAlt?: string;
  lienLabel?: string;
};

export type ImpactSeedItem = {
  valeur?: string;
  color?: string;
  videoYt?: string;
  lienUrl?: string;
  /** Jalons : la date réelle, mise en forme dans la langue de lecture. */
  dateISO?: string;
  coverKey?: ImgKey;
  /** Pastilles du gabarit POLES. Hors traduction, comme dans le contenu d'origine. */
  tags?: string[];
  fr: ImpactSeedTextes;
  en: ImpactSeedTextes;
};

/** En-tête d'une section dans une langue. */
export type ImpactSeedEntete = {
  kicker?: string;
  titre?: string;
  lead?: string;
  ctaLabel?: string;
  /** Ligne courte propre à certains gabarits : références, légende d'un aplat. */
  note?: string;
};

export type ImpactSeedSection = {
  /** Identifiant stable. C'est lui qui rend l'amorçage rejouable sans doublon. */
  key: string;
  emplacement: ImpactEmplacement;
  layout: ImpactLayout;
  theme: ImpactTheme;
  position: number;
  numero?: string;
  compact?: boolean;
  grandTitre?: boolean;
  /** La section poursuit la précédente, dans la même bande. */
  enchaine?: boolean;
  /** Chemin interne : la langue est ajoutée à l'affichage (« /project »). */
  ctaUrl?: string;
  /** `key` de la section dont les entrées sont reprises. */
  sourceKey?: string;
  limite?: number;
  fr: ImpactSeedEntete;
  en: ImpactSeedEntete;
  items: ImpactSeedItem[];
};
