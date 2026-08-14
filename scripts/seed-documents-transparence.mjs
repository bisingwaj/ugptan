/**
 * Reprise des pièces de référence de l'ancienne page « Transparence ».
 *
 * Avant la fusion des deux sections documentaires, `/transparency` servait dix
 * documents ÉCRITS EN DUR dans `src/content/marches.ts` : le manuel
 * d'exécution, les plans de passation, les cadres de sauvegardes. Ils
 * s'affichaient sans jamais se télécharger — aucun fichier n'a jamais existé
 * derrière eux. Ce script les fait entrer dans le CMS, pour que l'Unité n'ait
 * pas à ressaisir dix intitulés, dix sigles et leur classement.
 *
 *   node scripts/seed-documents-transparence.mjs --dry-run   (n'écrit rien)
 *   node scripts/seed-documents-transparence.mjs
 *
 * ⚠️ Le script ÉCRIT dans la base désignée par DATABASE_URL. Passer d'abord en
 * `--dry-run`.
 *
 * ─── Ce que le script fait, et ce qu'il ne fait pas ──────────────────────────
 *
 * Les fiches naissent en BROUILLON, et c'est le point important : elles n'ont
 * pas de fichier, et le module refuse de publier une pièce téléversée qui n'en
 * porte aucun (cf. `motifNonPubliable` dans src/actions/admin-documents.ts). Le
 * parcours attendu est donc : reprise ici, dépôt du PDF en console, puis
 * publication. Créer ces lignes directement en ligne aurait affiché dix
 * documents dont pas un ne s'ouvre.
 *
 * La DATE du document reste vide, sauf pour le manuel d'exécution dont le
 * millésime exact est connu (23 juin 2025). Le contenu statique ne portait
 * qu'une année pour les autres, et inscrire « 1er janvier » en tiendrait lieu
 * en inventant une précision que personne n'a. La console la demandera au dépôt.
 *
 * Reprenable : une pièce dont le slug ou le sigle existe déjà est ignorée. Une
 * interruption se relance donc sans doublon, et une fiche qu'un administrateur
 * a retouchée n'est jamais réécrite.
 */
import "dotenv/config";
import { createRequire } from "node:module";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Le client généré est du CommonJS — même raison qu'au script des médias.
const require = createRequire(import.meta.url);
const { PrismaClient } = require("../src/generated/prisma/client.js");

const SIMULATION = process.argv.includes("--dry-run");

/**
 * Nomenclature d'accueil, identique à celle qu'amorce
 * `src/lib/docs/bootstrap.ts` : le script se rattache aux catégories existantes
 * et ne crée que celles qui manquent, pour ne pas dédoubler une thématique
 * qu'un administrateur aurait déjà renommée.
 */
const CATEGORIES = [
  { slug: "reference", nomFr: "Référence", nomEn: "Reference", color: "#0f62fe", position: 10 },
  { slug: "suivi-evaluation", nomFr: "Suivi & évaluation", nomEn: "Monitoring & evaluation", color: "#8a3ffc", position: 20 },
  { slug: "sauvegardes", nomFr: "Sauvegardes E&S", nomEn: "E&S safeguards", color: "#009d9a", position: 30 },
  { slug: "passation", nomFr: "Passation & fiduciaire", nomEn: "Procurement & fiduciary", color: "#ff832b", position: 40 },
];

/**
 * Les dix pièces, dans l'ordre où elles doivent paraître.
 *
 * `position` suit la hiérarchie documentaire du projet et non l'alphabet : le
 * manuel d'exécution commande tout le reste, les instruments de passation
 * viennent ensuite, puis les sauvegardes, enfin le suivi financier. C'est
 * l'ordre dans lequel un auditeur ou un soumissionnaire les consulte.
 *
 * Les intitulés anglais sont ceux de la Banque mondiale pour ces instruments,
 * et non une traduction littérale du français : ce sont les noms sous lesquels
 * un lecteur anglophone les cherchera.
 */
const DOCUMENTS = [
  {
    slug: "manuel-execution-projet",
    reference: "MEP",
    version: "v1.0",
    type: "MANUEL",
    categorie: "reference",
    documentDate: "2025-06-23",
    titreFr: "Manuel d'Exécution du Projet",
    titreEn: "Project Implementation Manual",
    descriptionFr:
      "Le document de référence de l'exécution : rôles de l'Unité et des ministères sectoriels, circuits de décision, procédures fiduciaires et de passation, dispositif de suivi. Les autres pièces du fonds en découlent et ne peuvent le contredire.",
    descriptionEn:
      "The reference document for implementation: the roles of the Unit and of sector ministries, decision channels, fiduciary and procurement procedures, and the monitoring arrangements. The other pieces in this repository derive from it and cannot contradict it.",
  },
  {
    slug: "strategie-passation-marches-ppsd",
    reference: "PPSD",
    version: "v1.0",
    type: "PLAN",
    categorie: "passation",
    documentDate: null,
    titreFr: "Stratégie de Passation des Marchés pour le Développement",
    titreEn: "Project Procurement Strategy for Development",
    descriptionFr:
      "L'analyse du marché fournisseur qui justifie, pour chaque catégorie d'achat, la méthode de passation retenue et le degré de concurrence recherché. C'est elle qui explique pourquoi un lot part en appel d'offres international et un autre en consultation restreinte.",
    descriptionEn:
      "The supply-market analysis that justifies, for each procurement category, the method chosen and the degree of competition sought. It explains why one package goes to international competitive bidding and another to limited consultation.",
  },
  {
    slug: "plan-passation-marches",
    reference: "PPM",
    version: "T2 2026",
    type: "PLAN",
    categorie: "passation",
    documentDate: null,
    titreFr: "Plan de Passation des Marchés (18 mois)",
    titreEn: "Procurement Plan (18 months)",
    descriptionFr:
      "Les marchés prévus sur dix-huit mois glissants : objet, méthode, seuil de revue et calendrier prévisionnel. Le document est révisé à chaque actualisation approuvée, et c'est la version en cours qui engage l'Unité.",
    descriptionEn:
      "Contracts planned over a rolling eighteen months: subject, method, review threshold and indicative schedule. The document is revised at each approved update, and it is the current version that binds the Unit.",
  },
  {
    slug: "cadre-gestion-environnementale-sociale",
    reference: "CGES",
    version: "v2.1",
    type: "CADRE",
    categorie: "sauvegardes",
    documentDate: null,
    titreFr: "Cadre de Gestion Environnementale et Sociale",
    titreEn: "Environmental and Social Management Framework",
    descriptionFr:
      "La méthode d'examen des effets environnementaux et sociaux d'un sous-projet dont le site n'est pas connu à l'évaluation. Il fixe le tri préalable, les études exigées selon le niveau de risque et les mesures d'atténuation opposables à l'entreprise.",
    descriptionEn:
      "The method for screening the environmental and social effects of a sub-project whose site is not known at appraisal. It sets the initial screening, the studies required at each risk level, and the mitigation measures binding on the contractor.",
  },
  {
    slug: "cadre-politique-reinstallation",
    reference: "CPR",
    version: "v1.0",
    type: "CADRE",
    categorie: "sauvegardes",
    documentDate: null,
    titreFr: "Cadre de Politique de Réinstallation",
    titreEn: "Resettlement Policy Framework",
    descriptionFr:
      "Les règles applicables lorsqu'un tracé ou un site prive une personne de terre, de logement ou de revenu. Éligibilité, méthode d'évaluation des biens, compensation avant travaux et voies de recours, y compris pour l'occupant sans titre.",
    descriptionEn:
      "The rules that apply where a route or site deprives someone of land, housing or income. Eligibility, asset valuation method, compensation ahead of works, and avenues of recourse, including for occupants without title.",
  },
  {
    slug: "plan-populations-autochtones",
    reference: "PPA",
    version: "v1.0",
    type: "PLAN",
    categorie: "sauvegardes",
    documentDate: null,
    titreFr: "Plan en Faveur des Populations Autochtones",
    titreEn: "Indigenous Peoples Plan",
    descriptionFr:
      "Les dispositions propres aux communautés autochtones présentes sur les zones d'intervention : consultation préalable, libre et éclairée, adaptation des services numériques aux langues et aux usages locaux, partage des bénéfices du projet.",
    descriptionEn:
      "Provisions specific to indigenous communities in the intervention areas: free, prior and informed consultation, adaptation of digital services to local languages and practices, and sharing in the project's benefits.",
  },
  {
    slug: "plan-mobilisation-parties-prenantes",
    reference: "PMPP",
    version: "v1.2",
    type: "PLAN",
    categorie: "sauvegardes",
    documentDate: null,
    titreFr: "Plan de Mobilisation des Parties Prenantes",
    titreEn: "Stakeholder Engagement Plan",
    descriptionFr:
      "Qui est consulté, à quel moment et sous quelle forme, du ministère sectoriel à l'habitant d'une zone de travaux. Le plan porte aussi le mécanisme de gestion des plaintes et les délais de réponse que l'Unité s'impose.",
    descriptionEn:
      "Who is consulted, when and in what form, from sector ministries to residents of a works area. The plan also carries the grievance mechanism and the response times the Unit holds itself to.",
  },
  {
    slug: "procedures-gestion-main-doeuvre",
    reference: "PGMO",
    version: "v1.0",
    type: "CADRE",
    categorie: "sauvegardes",
    documentDate: null,
    titreFr: "Procédures de Gestion de la Main d'Œuvre",
    titreEn: "Labour Management Procedures",
    descriptionFr:
      "Les conditions d'emploi opposables aux entreprises et à leurs sous-traitants : recrutement, âge minimum, santé et sécurité au travail, mécanisme de plainte propre aux travailleurs, distinct de celui ouvert aux communautés.",
    descriptionEn:
      "Employment conditions binding on contractors and their subcontractors: recruitment, minimum age, occupational health and safety, and a workers' grievance mechanism separate from the one open to communities.",
  },
  {
    slug: "plan-engagement-environnemental-social",
    reference: "PEES",
    version: "évolutif",
    type: "PLAN",
    categorie: "sauvegardes",
    documentDate: null,
    titreFr: "Plan d'Engagement Environnemental et Social",
    titreEn: "Environmental and Social Commitment Plan",
    descriptionFr:
      "Les engagements environnementaux et sociaux souscrits par la RDC au titre de l'accord de financement, avec leur échéance. Le document est révisé en cours d'exécution, d'où l'absence de numéro de version figée.",
    descriptionEn:
      "The environmental and social commitments entered into by the DRC under the financing agreement, each with its deadline. The document is revised during implementation, hence the absence of a fixed version number.",
  },
  {
    slug: "syntheses-rapports-financiers-interimaires",
    reference: "RFI",
    version: "T1 2026",
    type: "RAPPORT",
    categorie: "passation",
    documentDate: null,
    titreFr: "Synthèse des Rapports Financiers Intermédiaires",
    titreEn: "Interim Financial Reports Summary",
    descriptionFr:
      "L'état trimestriel des dépenses par composante et par catégorie, rapproché des décaissements du bailleur. La synthèse est publiée après revue ; les états détaillés restent des pièces d'audit.",
    descriptionEn:
      "The quarterly statement of expenditure by component and category, reconciled against donor disbursements. The summary is published after review; the detailed statements remain audit documents.",
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL absente de l'environnement.");
    process.exitCode = 1;
    return;
  }

  neonConfig.webSocketConstructor = ws;
  const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });

  if (SIMULATION) console.log("SIMULATION — aucune écriture.\n");

  try {
    /* --- Catégories ------------------------------------------------------ */
    const existantes = await db.documentCategory.findMany({ select: { id: true, slug: true } });
    const parSlug = new Map(existantes.map((c) => [c.slug, c.id]));

    for (const categorie of CATEGORIES) {
      if (parSlug.has(categorie.slug)) continue;
      if (SIMULATION) {
        console.log(`  + catégorie « ${categorie.nomFr} » serait créée.`);
        parSlug.set(categorie.slug, `simulation-${categorie.slug}`);
        continue;
      }
      const creee = await db.documentCategory.create({ data: categorie, select: { id: true } });
      parSlug.set(categorie.slug, creee.id);
      console.log(`  + catégorie « ${categorie.nomFr} » créée.`);
    }

    /* --- Documents ------------------------------------------------------- */
    // Les deux clés d'unicité sont relevées d'un coup : le slug, contraint en
    // base, et le sigle, qui ne l'est pas mais désigne la pièce dans les
    // échanges. Une reprise déjà faite sous un autre slug ne doit pas repartir.
    const deja = await db.document.findMany({ select: { slug: true, reference: true } });
    const slugsPris = new Set(deja.map((d) => d.slug).filter(Boolean));
    const siglesPris = new Set(deja.map((d) => d.reference).filter(Boolean));

    let crees = 0;
    let ignores = 0;

    for (const [index, piece] of DOCUMENTS.entries()) {
      if (slugsPris.has(piece.slug) || siglesPris.has(piece.reference)) {
        console.log(`  ─ ${piece.reference} : déjà en base, ignoré.`);
        ignores += 1;
        continue;
      }

      const categoryId = parSlug.get(piece.categorie) ?? null;

      if (SIMULATION) {
        console.log(`  · ${piece.reference} — ${piece.titreFr} (brouillon, ${piece.categorie}).`);
        crees += 1;
        continue;
      }

      await db.document.create({
        data: {
          status: "DRAFT",
          support: "FICHIER",
          type: piece.type,
          slug: piece.slug,
          titreFr: piece.titreFr,
          titreEn: piece.titreEn,
          descriptionFr: piece.descriptionFr,
          descriptionEn: piece.descriptionEn,
          reference: piece.reference,
          version: piece.version,
          auteur: "UGPTN",
          langue: "FR",
          documentDate: piece.documentDate ? new Date(`${piece.documentDate}T00:00:00Z`) : null,
          // Dix positions espacées de dix : une pièce peut s'intercaler plus
          // tard sans avoir à renuméroter toute la liste.
          position: (index + 1) * 10,
          categoryId,
        },
      });

      console.log(`  + ${piece.reference} — ${piece.titreFr}`);
      crees += 1;
    }

    console.log(
      `\n${crees} fiche(s) ${SIMULATION ? "seraient créées" : "créées"}, ${ignores} ignorée(s).`,
    );
    if (crees > 0 && !SIMULATION) {
      console.log(
        "Les fiches sont en BROUILLON et sans fichier. Déposer le PDF de chacune\n" +
          "depuis la console (Contenus → Ressources & publications), compléter la\n" +
          "date du document, puis publier.",
      );
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((erreur) => {
  console.error(erreur);
  process.exitCode = 1;
});
