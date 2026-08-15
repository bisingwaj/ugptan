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
    zone: { fr: "Héros — film du projet (fond vidéo + lightbox « Voir le film »)", en: "Hero — project film (background video + « Watch the film » lightbox)" },
    ratio: "16:9", duree: "60–90 s", status: "provisoire",
    note: { fr: "Vidéo en place (public/videos/hero-film.mp4) : fond muet en boucle + lecture avec son via « Voir le film ». Extrait provisoire à remplacer par le film complet.", en: "Video in place (public/videos/hero-film.mp4): muted looping background + sound playback via « Watch the film ». Provisional excerpt to be replaced by the full film." },
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
  /* ⚠️ L'emplacement « projvideos » a été retiré : il annonçait cinq films
     thématiques, un par composante, que l'emplacement « composante-presentation »
     ci-dessous annonçait déjà. Le plan média comptait donc dix tournages pour
     cinq. La section « Le projet en vidéos » de « Résultats », qui portait cet
     emplacement, a elle aussi disparu — elle affichait un bouton de lecture
     devant une vidéo inexistante. */
  {
    key: "composante-presentation",
    page: { fr: "Composantes (page dédiée C1 → C5)", en: "Components (dedicated page C1 → C5)" },
    zone: { fr: "Bandeau « Vidéo de présentation » de la page de composante", en: "« Presentation video » banner on the component page" },
    ratio: "16:9", duree: "2–4 min", count: 5, status: "a_fournir",
    note: { fr: "Un film par composante, présenté par son responsable : périmètre, projets phares, résultats attendus. Renseigner video.yt (id YouTube) ou video.src (fichier) dans content/composantes-detail.ts. Tant qu'aucune vidéo n'est fournie, l'emplacement affiche un état « à venir » assumé.", en: "One film per component, presented by its lead: scope, flagship projects, expected results. Set video.yt (YouTube id) or video.src (file) in content/composantes-detail.ts. Until a video is supplied, the slot shows an explicit « coming soon » state." },
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
