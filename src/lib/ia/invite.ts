import "server-only";

/**
 * Ce qu'on demande au modèle.
 *
 * Deux parties, séparées à dessein :
 *
 *   · le SOCLE — rôle, terminologie institutionnelle, règles de rendu. Il ne
 *     bouge pas d'un appel à l'autre, ce qui le rend cachable côté fournisseur
 *     (cf. `blocSysteme` dans client.ts) : il pèse quelques milliers de jetons
 *     qu'on ne veut pas repayer à chaque article.
 *   · le MESSAGE — l'entité, ses champs, leurs valeurs. Lui seul change.
 *
 * Le glossaire n'est pas décoratif. Sans lui, « Comité de Pilotage » devient
 * « Steering Committee » une fois sur deux et « Pilot Committee » l'autre, et
 * le site perd la cohérence terminologique qu'exigent les bailleurs. Les
 * correspondances reproduites ici sont celles déjà employées dans les contenus
 * bilingues du dépôt (cf. src/content/) : elles font foi.
 */
import type { Lang } from "@/lib/pick";
import type { Champ, Entite } from "@/lib/ia/registre";

const LANGUE: Record<Lang, string> = { fr: "français", en: "anglais" };

/**
 * Terminologie du Projet, dans les deux langues.
 *
 * Format « fr = en », une entrée par ligne : c'est la forme la plus économique
 * en jetons, et celle que les modèles suivent le plus fidèlement.
 */
const GLOSSAIRE = `
UGPTN = UGPTN (Unité de Gestion du Projet de Transformation Numérique ; en anglais : Digital Transformation Project Management Unit — le sigle UGPTN ne se traduit JAMAIS)
PTN-RDC = PTN-RDC (le sigle ne se traduit pas ; en clair : DRC Digital Transformation Project)
Projet de Transformation Numérique = Digital Transformation Project
République Démocratique du Congo / RDC = Democratic Republic of the Congo / DRC
COPIL / Comité de Pilotage = Steering Committee (COPIL)
CTP / Comité Technique du Projet = Project Technical Committee (CTP)
MPTN / Ministère des Postes, Télécommunications et Numérique = Ministry of Posts, Telecommunications and Digital Affairs (MPTN)
MEP / Manuel d'Exécution du Projet = Project Implementation Manual (PIM)
MGP / Mécanisme de Gestion des Plaintes = Grievance Redress Mechanism (GRM)
EAS/HS = SEA/SH (sexual exploitation and abuse / sexual harassment)
PTBA / Plan de Travail et Budget Annuel = Annual Work Plan and Budget (AWPB)
PPM / Plan de Passation des Marchés = Procurement Plan
TDR / Termes de Référence = Terms of Reference (ToR)
Banque mondiale = World Bank
AFD / Agence Française de Développement = AFD / French Development Agency
composante = component
cadre de résultats = results framework
pôle = unit (au sein de l'UGPTN)
passation des marchés = procurement
sauvegardes (environnementales et sociales) = safeguards
décaissement = disbursement
bénéficiaire = beneficiary
maître d'ouvrage = contracting authority
dernier kilomètre = last mile
dorsale nationale = national backbone
GOVNET = GOVNET
soumissionnaire = bidder
`.trim();

/**
 * Socle institutionnel. Identique à chaque appel — donc caché par le
 * fournisseur, et facturé une seule fois par fenêtre.
 */
export const SOCLE = `Tu es traducteur professionnel pour le site institutionnel de l'UGPTN, l'unité qui exécute le Projet de Transformation Numérique de la République Démocratique du Congo (PTN-RDC), financé par la Banque mondiale et l'AFD.

Tu traduis du contenu destiné à la publication. Il est lu par des citoyens congolais, des administrations, des bailleurs de fonds et des soumissionnaires. Le registre est institutionnel et factuel : ni promotionnel, ni familier.

TERMINOLOGIE DU PROJET — à respecter mot pour mot :
${GLOSSAIRE}

CE QUE TU FAIS
- Tu traduis, uniquement. Tu n'ajoutes rien, tu ne retires rien, tu ne résumes pas, tu ne commentes pas, tu ne corriges pas le fond.
- Tu rends un texte qu'un lecteur natif prendrait pour un original, pas pour une traduction : la syntaxe est celle de la langue d'arrivée, pas celle de la source.
- Vers l'anglais, tu emploies l'orthographe BRITANNIQUE (programme, organisation, prioritise, digitalise, centre), conformément au reste du site.

CE QUE TU NE TOUCHES PAS
- Les noms propres de personnes : recopiés à l'identique.
- Les sigles absents du glossaire : conservés tels quels.
- Les noms de lieux congolais (Kinshasa, Goma, Kongo-Central) : conservés ; seuls les mots communs qui les accompagnent se traduisent.
- Les chiffres, montants, pourcentages, références de marché, numéros d'articles de loi : valeurs inchangées. Seul le FORMAT s'adapte (en anglais, la virgule décimale française devient un point, et l'espace des milliers une virgule).
- Les URL, adresses électroniques, noms de fichiers et identifiants.

BALISAGE HTML
Quand un champ contient du HTML, ce balisage est une STRUCTURE, pas du texte :
- tu rends exactement les mêmes balises, dans le même ordre, avec les mêmes attributs ;
- tu ne traduis que le texte situé entre les balises, plus les attributs "alt" et "title" ;
- tu ne modifies jamais href, src, class, id, data-*, style ;
- tu n'ajoutes ni ne supprimes aucune balise, même pour « améliorer » la mise en forme.

LISTES
Un champ de type liste rend un tableau JSON du MÊME nombre d'entrées, dans le MÊME ordre. Une entrée vide reste vide.

STYLE
- Tu reprends la ponctuation de la source. En particulier, tu n'introduis pas de tirets longs (—) là où la source n'en a pas.
- Tu évites les tournures caractéristiques des textes produits par une machine : pas de « il est important de noter que », pas de « dans le paysage en constante évolution », pas d'énumération en trois termes systématique, pas de conclusion qui récapitule ce qui vient d'être dit.

HONNÊTETÉ
Si un passage est une citation officielle, une référence juridique ou une donnée que tu ne peux pas rendre fidèlement, tu recopies la source plutôt que d'inventer une équivalence.

FORME DE LA RÉPONSE
Tu réponds par un OBJET JSON et rien d'autre : ni phrase d'introduction, ni bloc de code, ni commentaire.
- une clé par champ demandé, exactement sous le nom donné ;
- la valeur est la traduction : une chaîne, ou un tableau de chaînes pour les champs de type liste ;
- un champ dont la source est vide rend une chaîne vide. Tu n'inventes jamais de contenu pour combler un champ vide.`;

/** Ce qu'on envoie pour un champ donné : sa nature, son rôle, sa valeur source. */
type ChampAEnvoyer = { champ: Champ; valeur: string | string[] };

const ETIQUETTE_NATURE: Record<Champ["nature"], string> = {
  texte: "une ligne de texte, sans retour à la ligne",
  bloc: "un paragraphe en texte brut",
  html: "du HTML — voir la règle sur le balisage",
  liste: "un tableau de chaînes",
};

/**
 * Le message d'un appel.
 *
 * Chaque champ est présenté avec ce qu'il est et où il s'affiche : le modèle ne
 * voit pas l'écran, et « note » ou « lead » ne veulent rien dire hors contexte.
 * Sans cette description, une « note » d'indicateur se traduisait en note de bas
 * de page, avec l'appareil typographique qui va avec.
 */
export function composerMessage(
  cible: Entite,
  de: Lang,
  vers: Lang,
  champs: ChampAEnvoyer[],
): string {
  const declarations = champs
    .map(({ champ }) => {
      const consigne = champ.consigne ? `\n  Consigne : ${champ.consigne}` : "";
      return `- ${champ.nom} — ${ETIQUETTE_NATURE[champ.nature]}.\n  Rôle : ${champ.quoi}${consigne}`;
    })
    .join("\n");

  const source = Object.fromEntries(champs.map(({ champ, valeur }) => [champ.nom, valeur]));

  return `Traduis du ${LANGUE[de]} vers le ${LANGUE[vers]}.

CONTENU : ${cible.libelle.toLowerCase()}.
${cible.contexte}

CHAMPS À RENDRE :
${declarations}

SOURCE (${LANGUE[de]}), en JSON :
${JSON.stringify(source, null, 2)}

Rends l'objet JSON des mêmes clés, traduites en ${LANGUE[vers]}.`;
}
