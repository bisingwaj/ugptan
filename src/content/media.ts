/* Médias — vidéo par défaut + photographies art-dirigées (duotone bleu).
   En production : remplacer ces URL par vos visuels officiels (CDN). */
import type { Media } from "./types";

/** Tiny duotone gradient used as a reliable <img> onError fallback. */
export const FALLBACK_IMG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5IiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMyMjMwNDciLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzYTRkNmUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==";

export const media: Media = {
  videoYt: "2ZJGxoF610c",
  /** Film du projet hébergé localement (fond + lightbox du héros). */
  heroFilm: "/videos/hero-film.mp4",
  videoTitre: { fr: "Film du projet", en: "Project film" },
  videoSource: { fr: "UGPTAN · PTN-RDC", en: "UGPTAN · PTN-RDC" },
  videoNote: { fr: "Aperçu du Projet de Transformation Numérique de la RDC — accès, fondations numériques, compétences et inclusion.", en: "Overview of the Digital Transformation Project of the DRC — access, digital foundations, skills and inclusion." },
  /* Photographies africaines vérifiées visuellement (Unsplash) : mettent en
     avant des Africains dans des contextes numériques, en RDC/Afrique. */
  img: {
    hero: "https://images.unsplash.com/photo-1528901166007-3784c7dd3653?auto=format&fit=crop&w=1600&q=72",
    citoyens: "https://images.unsplash.com/photo-1544813813-2c73bec209ca?auto=format&fit=crop&w=1200&q=72",
    fibre: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=70",
    datacenter: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=70",
    formation: "https://images.unsplash.com/photo-1531498860502-7c67cf02f657?auto=format&fit=crop&w=1200&q=72",
    femmes: "https://images.unsplash.com/photo-1612831197630-ba9be548f9a9?auto=format&fit=crop&w=1200&q=72",
    tour: "https://images.unsplash.com/photo-1695071622344-75bb5863bc83?auto=format&fit=crop&w=1200&q=72",
    ville: "https://images.unsplash.com/photo-1695071621436-56c7493ccb2d?auto=format&fit=crop&w=1200&q=72",
    hub: "https://images.unsplash.com/photo-1742339879400-04cae8a582a6?auto=format&fit=crop&w=1200&q=72",
    data: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1100&q=72",
    sante: "https://images.unsplash.com/photo-1678695972687-033fa0bdbac9?auto=format&fit=crop&w=1200&q=72",
    agri: "https://images.unsplash.com/photo-1741874299706-2b8e16839aaa?auto=format&fit=crop&w=1200&q=72",
  },
};

export const ytEmbed = (id: string): string =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
