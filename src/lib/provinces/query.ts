/**
 * Couche de lecture du module « Provinces » — l'unique porte d'entrée des pages
 * province vers les tables `ProvinceFiche` et `ProvinceProjet`.
 *
 * Mêmes invariants que les autres modules (cf. lib/gouvernance/query.ts) : rien
 * ne sort qui ne soit publié ; rien ne sort dans la mauvaise langue ; et tant
 * que la table ne porte aucune ligne publiée, le contenu d'origine
 * (content/provinces-fiches.ts, content/provinces-projets.ts) prend le relais.
 *
 * Le repli se décide sur la TABLE entière, pas province par province : une
 * fiche publiée en base et les vingt-cinq autres lues dans le code mêleraient
 * deux états de la recherche documentaire sans que rien ne le signale.
 */
import { db } from "@/lib/db";
import { lecteur } from "@/lib/lecture";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { cacheJson, TAG, TTL } from "@/lib/cache/redis";
import { provincesFiches } from "@/content/provinces-fiches";
import { provincesProjets } from "@/content/provinces-projets";
import { estOdd, projetTraduit, type AvancementProjet } from "@/lib/provinces/statut";

const lecteurBase = lecteur("provinces");

/**
 * `lecteur`, plus un seul repli : la table encore ABSENTE (P2021), le temps que
 * le schéma soit poussé en base après le déploiement du code. Le contenu
 * d'origine prend alors le relais, comme pour une table vide. Toute autre
 * panne remonte, comme ailleurs.
 */
async function lecture<T>(faire: () => Promise<T>, repli: T, contexte: string): Promise<T> {
  try {
    return await lecteurBase(faire, repli, contexte);
  } catch (error) {
    if ((error as { code?: string } | null)?.code === "P2021") return repli;
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* Vues                                                                        */
/* -------------------------------------------------------------------------- */

export type FicheVue = {
  slug: string;
  chefLieu: string | null;
  superficieKm2: number | null;
  population: number | null;
  populationAnnee: number | null;
  populationSource: string | null;
  territoires: number | null;
  communes: number | null;
  villes: string[];
  gouverneur: string | null;
  viceGouverneur: string | null;
  /** AAAA-MM-JJ. */
  gouverneurDate: string | null;
  gouverneurSource: string | null;
  langues: string[];
  sources: string[];
  description: string | null;
  administration: string | null;
};

export type ProjetVue = {
  id: string;
  composante: string | null;
  avancement: AvancementProjet;
  odd: number[];
  /** Vide : projet national. */
  provinces: string[];
  titre: string;
  resume: string | null;
  lieu: string | null;
};

const vide = (valeur: string | null | undefined): string | null => {
  const texte = (valeur ?? "").trim();
  return texte.length > 0 ? texte : null;
};

const jour = (date: Date | null): string | null => (date ? date.toISOString().slice(0, 10) : null);

/* -------------------------------------------------------------------------- */
/* Fiche                                                                       */
/* -------------------------------------------------------------------------- */

const fichesPubliees = (lang: Lang) =>
  cacheJson(`provinces:fiches:${lang}`, { tags: [TAG.provinces], ttl: TTL.socle }, () => fichesImpl(lang));

/** Fiche publiée d'une province, ou `null` si elle n'en a pas. */
export async function ficheProvince(slug: string, lang: Lang): Promise<FicheVue | null> {
  const toutes = await fichesPubliees(lang);
  return toutes.find((fiche) => fiche.slug === slug) ?? null;
}

export type ResumeProvince = { chefLieu: string | null; population: number | null; projets: number };

/**
 * Ce que l'index montre de chaque province : chef-lieu, population et nombre
 * de projets qui la CITENT — les nationaux, communs aux vingt-six, n'y
 * distingueraient rien. Lu dans les mêmes caches que les pages de détail.
 */
export async function resumesProvinces(lang: Lang): Promise<Map<string, ResumeProvince>> {
  const [fiches, projets] = await Promise.all([fichesPubliees(lang), projetsPublies(lang)]);
  const resumes = new Map<string, ResumeProvince>();
  for (const fiche of fiches) {
    resumes.set(fiche.slug, { chefLieu: fiche.chefLieu, population: fiche.population, projets: 0 });
  }
  for (const projet of projets) {
    for (const slug of projet.provinces) {
      const resume = resumes.get(slug) ?? { chefLieu: null, population: null, projets: 0 };
      resume.projets += 1;
      resumes.set(slug, resume);
    }
  }
  return resumes;
}

async function fichesImpl(lang: Lang): Promise<FicheVue[]> {
  const lignes = await lecture(
    () => db().provinceFiche.findMany({
      where: { status: "PUBLISHED" },
      include: { translations: { select: { locale: true, description: true, administration: true } } },
    }),
    [],
    "fiches des provinces",
  );

  if (lignes.length === 0) {
    return provincesFiches.map((fiche) => ({
      ...fiche,
      description: vide(pick(fiche.description, lang)),
      administration: fiche.administration ? vide(pick(fiche.administration, lang)) : null,
    }));
  }

  return lignes.map((fiche) => {
    const tr = fiche.translations.find((item) => item.locale === lang);
    return {
      slug: fiche.slug,
      chefLieu: vide(fiche.chefLieu),
      superficieKm2: fiche.superficieKm2,
      population: fiche.population,
      populationAnnee: fiche.populationAnnee,
      populationSource: vide(fiche.populationSource),
      territoires: fiche.territoires,
      communes: fiche.communes,
      villes: fiche.villes,
      gouverneur: vide(fiche.gouverneur),
      viceGouverneur: vide(fiche.viceGouverneur),
      gouverneurDate: jour(fiche.gouverneurDate),
      gouverneurSource: vide(fiche.gouverneurSource),
      langues: fiche.langues,
      sources: fiche.sources,
      description: vide(tr?.description),
      administration: vide(tr?.administration),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Projets                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Projets publiés qui concernent une province : ceux qui la citent, puis les
 * projets nationaux. Les premiers d'abord — ce que le projet fait LÀ prime sur
 * ce qu'il fait partout.
 */
const projetsPublies = (lang: Lang) =>
  cacheJson(`provinces:projets:${lang}`, { tags: [TAG.provinces], ttl: TTL.socle }, () => projetsImpl(lang));

export async function projetsProvince(slug: string, lang: Lang): Promise<ProjetVue[]> {
  const tous = await projetsPublies(lang);
  const locaux = tous.filter((projet) => projet.provinces.includes(slug));
  const nationaux = tous.filter((projet) => projet.provinces.length === 0);
  return [...locaux, ...nationaux];
}

async function projetsImpl(lang: Lang): Promise<ProjetVue[]> {
  const lignes = await lecture(
    () => db().provinceProjet.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      include: { translations: { select: { locale: true, titre: true, resume: true, lieu: true } } },
    }),
    [],
    "projets des provinces",
  );

  if (lignes.length === 0) {
    return provincesProjets.map((projet) => ({
      id: `seed-${projet.key}`,
      composante: projet.composante,
      avancement: projet.avancement,
      odd: projet.odd,
      provinces: projet.provinces,
      titre: pick(projet.titre, lang),
      resume: vide(pick(projet.resume, lang)),
      lieu: null,
    }));
  }

  return lignes
    .map((projet): ProjetVue | null => {
      const tr = projet.translations.find((item) => item.locale === lang);
      if (!tr || !projetTraduit(tr)) return null;
      return {
        id: projet.id,
        composante: vide(projet.composante),
        avancement: projet.avancement,
        odd: projet.odd.filter(estOdd),
        provinces: projet.provinces,
        titre: vide(tr.titre) ?? "",
        resume: vide(tr.resume),
        lieu: vide(tr.lieu),
      };
    })
    .filter((projet): projet is ProjetVue => projet !== null);
}
