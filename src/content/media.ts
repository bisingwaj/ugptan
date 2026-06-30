/* Médias — vidéo par défaut + photographies art-dirigées (duotone bleu).
   En production : remplacer ces URL par vos visuels officiels (CDN). */
import type { Media } from "./types";

/** Tiny duotone gradient used as a reliable <img> onError fallback. */
export const FALLBACK_IMG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5IiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMyMjMwNDciLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzYTRkNmUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==";

export const media: Media = {
  videoYt: "2ZJGxoF610c",
  videoTitre: { fr: "Accélérer la transformation numérique de l'Afrique", en: "Accelerating Africa's Digital Transformation" },
  videoSource: { fr: "Groupe de la Banque mondiale · 2023", en: "World Bank Group · 2023" },
  videoNote: { fr: "Vidéo d'illustration provisoire — à remplacer par le film institutionnel du Projet.", en: "Interim illustrative video — to be replaced by the Project's institutional film." },
  img: {
    hero: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=70",
    citoyens: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1100&q=72",
    fibre: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=70",
    datacenter: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=70",
    formation: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=72",
    femmes: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1100&q=72",
    tour: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1100&q=72",
    ville: "https://images.unsplash.com/photo-1568454537842-d933259bb258?auto=format&fit=crop&w=1100&q=72",
    hub: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1100&q=72",
    data: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1100&q=72",
  },
};

export const ytEmbed = (id: string): string =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
