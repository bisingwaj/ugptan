/**
 * Vidéos associées aux articles.
 *
 * Sans import : le module est lu par l'éditeur (client) autant que par la
 * server action qui enregistre l'article, et par les pages publiques.
 */

/**
 * Identifiant YouTube, accepté sous toutes ses formes courantes : lien de
 * partage, lien de lecture, lien intégré, Short, direct, ou identifiant nu.
 *
 * Les auteurs collent l'URL de la barre d'adresse ; exiger l'identifiant seul
 * serait une consigne de plus à retenir et une erreur de plus à commettre.
 */
export function idYouTube(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (/^[\w-]{11}$/.test(value)) return value;

  const motifs = [
    /youtu\.be\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
    /\/live\/([\w-]{11})/,
  ];

  for (const motif of motifs) {
    const trouve = motif.exec(value);
    if (trouve) return trouve[1];
  }
  return null;
}

/**
 * URL d'intégration. Domaine « nocookie » : aucun cookie de suivi n'est déposé
 * tant que le visiteur n'a pas lancé la lecture.
 */
export const urlIntegrationYouTube = (id: string): string =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;

/** Vignette d'une vidéo, servie par YouTube. */
export const vignetteYouTube = (id: string): string =>
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
