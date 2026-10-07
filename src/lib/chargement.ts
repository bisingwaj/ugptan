/**
 * Libellés des écrans de chargement, dans les deux langues du site.
 *
 * ─── Pourquoi un module à part ──────────────────────────────────────────────
 *
 * Un `loading.tsx` ne reçoit AUCUNE prop de Next — ni `params`, ni
 * `searchParams` (cf. node_modules/next/dist/server/app-render/
 * create-component-tree.js, où l'élément est créé avec sa seule clé). La
 * langue ne peut donc s'y lire que côté client, par `useParams()`, et c'est ce
 * que font les écrans du segment `[lang]`. Ils restent rendus au serveur comme
 * tout composant client : le squelette et son libellé sont dans le HTML
 * initial, avant tout JavaScript.
 *
 * Les libellés vivent ici plutôt que dans le dictionnaire du site : ils ne
 * servent qu'aux lecteurs d'écran (`aria-label` du conteneur `role="status"`),
 * et les tenir à part évite de faire dépendre ces écrans, chargés avant tout le
 * reste, du dictionnaire complet.
 *
 * Langue inconnue (segment absent ou inattendu) : un libellé NEUTRE, dans les
 * deux langues, plutôt qu'un choix qui serait faux une fois sur deux.
 */

export type CleChargement =
  | "page"
  | "actus"
  | "article"
  | "evenements"
  | "evenement"
  | "galerie"
  | "documents"
  | "document"
  | "gouvernance"
  | "ugptn"
  | "recherche";

const LIBELLES: Record<CleChargement, { fr: string; en: string }> = {
  page: { fr: "Chargement en cours", en: "Loading" },
  actus: { fr: "Chargement des actualités", en: "Loading news" },
  article: { fr: "Chargement de l'article", en: "Loading article" },
  evenements: { fr: "Chargement des événements", en: "Loading events" },
  evenement: { fr: "Chargement de l'événement", en: "Loading event" },
  galerie: { fr: "Chargement de la galerie", en: "Loading gallery" },
  documents: { fr: "Chargement des documents", en: "Loading documents" },
  document: { fr: "Chargement du document", en: "Loading document" },
  gouvernance: { fr: "Chargement de la gouvernance", en: "Loading governance" },
  ugptn: { fr: "Chargement de la page « L'UGPTN »", en: "Loading the UGPTN page" },
  recherche: { fr: "Recherche en cours", en: "Searching" },
};

/** Libellé de l'écran `cle`, dans la langue du segment si elle est connue. */
export function libelleChargement(lang: unknown, cle: CleChargement): string {
  const libelle = LIBELLES[cle];
  if (lang === "fr") return libelle.fr;
  if (lang === "en") return libelle.en;
  return `${libelle.fr} · ${libelle.en}`;
}
