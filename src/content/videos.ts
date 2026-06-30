/* ============================================================================
   Registre des EMPLACEMENTS VIDÉO du site — « où c'est prévu qu'il y ait
   une vidéo ». Sert au plan média (/[lang]/medias) et de référence de tournage.
   La lecture réelle utilise media.videoYt / actualites[].videoYt ; ce registre
   documente chaque emplacement (format, durée conseillée, statut).
   ========================================================================== */
import type { Bilingual } from "@/lib/pick";

export type Ratio = "16:9" | "9:16" | "1:1";
export type SlotStatus = "fourni" | "provisoire" | "a_fournir" | "optionnel";

export type VideoSlot = {
  key: string;
  page: Bilingual;       // page concernée
  zone: Bilingual;       // emplacement précis dans la page
  ratio: Ratio;
  duree: string;         // durée conseillée
  count?: number;        // nombre d'occurrences (ex. 5 vidéos par composante)
  status: SlotStatus;
  note: Bilingual;
};

export const videoSlots: VideoSlot[] = [
  {
    key: "hero-accueil",
    page: { fr: "Accueil", en: "Home" },
    zone: { fr: "Héros — film du projet (fond animé + lightbox « Voir le film »)", en: "Hero — project film (animated background + « Watch the film » lightbox)" },
    ratio: "16:9", duree: "60–90 s", status: "provisoire",
    note: { fr: "Film institutionnel d'ouverture. Actuellement une vidéo provisoire (Banque mondiale). À remplacer par le film officiel du Projet.", en: "Institutional opening film. Currently a placeholder (World Bank). Replace with the Project's official film." },
  },
  {
    key: "hero-pages",
    page: { fr: "Toutes les pages", en: "All pages" },
    zone: { fr: "Héros de page — vidéo d'intro courte (optionnel)", en: "Page hero — short intro video (optional)" },
    ratio: "16:9", duree: "15–30 s", status: "optionnel",
    note: { fr: "Chaque héros de page peut accueillir une vidéo d'intro discrète (ou un fond animé). À cadrer avec la direction.", en: "Each page hero can host a discreet intro video (or animated background). To be confirmed with the editorial lead." },
  },
  {
    key: "histoires",
    page: { fr: "Accueil + Résultats", en: "Home + Results" },
    zone: { fr: "Cartes « Histoires & impact » — témoignages de bénéficiaires", en: "« Stories & impact » cards — beneficiary testimonials" },
    ratio: "16:9", duree: "60–90 s", count: 4, status: "a_fournir",
    note: { fr: "Une vidéo par bénéficiaire (Esther, Jean-Pierre, Dr Mwamba, Mama Kavira). Tournage terrain, sous-titres FR/EN.", en: "One video per beneficiary. Field shoot, FR/EN subtitles." },
  },
  {
    key: "projvideos",
    page: { fr: "Résultats", en: "Results" },
    zone: { fr: "« Le projet en vidéos » — une vidéo par composante (C1 → C5)", en: "« The project in videos » — one video per component (C1 → C5)" },
    ratio: "16:9", duree: "2–5 min", count: 5, status: "a_fournir",
    note: { fr: "Films thématiques : accès & inclusion, fondations, compétences, coordination, réponse d'urgence.", en: "Thematic films: access & inclusion, foundations, skills, coordination, emergency response." },
  },
  {
    key: "marche-banner",
    page: { fr: "Marchés (fiche d'avis)", en: "Tenders (notice detail)" },
    zone: { fr: "Bannière de la fiche détaillée d'un appel d'offres", en: "Banner of a tender's detail panel" },
    ratio: "16:9", duree: "30–90 s", status: "optionnel",
    note: { fr: "Courte présentation du marché / des attendus (s'ouvre en lightbox via ▶).", en: "Short presentation of the contract (opens in a lightbox via ▶)." },
  },
  {
    key: "actualite-article",
    page: { fr: "Actualités (article)", en: "News (article)" },
    zone: { fr: "Vidéo associée à un article (bouton « Voir la vidéo associée »)", en: "Video attached to an article (« Watch the related video » button)" },
    ratio: "16:9", duree: "variable", status: "optionnel",
    note: { fr: "Renseigner le champ videoYt de l'article concerné dans content/actualites.ts.", en: "Set the article's videoYt field in content/actualites.ts." },
  },
];

export const statusLabel = (s: SlotStatus): Bilingual => ({
  fourni: { fr: "Fourni", en: "Provided" },
  provisoire: { fr: "Provisoire", en: "Placeholder" },
  a_fournir: { fr: "À fournir", en: "To be provided" },
  optionnel: { fr: "Optionnel", en: "Optional" },
}[s]);

export const statusColor = (s: SlotStatus): string => ({
  fourni: "#198038", provisoire: "#ff832b", a_fournir: "#0f62fe", optionnel: "#8d8d8d",
}[s]);
