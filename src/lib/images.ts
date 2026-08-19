/**
 * Dérivations d'URL pour l'AFFICHAGE des images.
 *
 * Deux besoins, une même mécanique : réécrire l'adresse d'un visuel pour en
 * obtenir une variante plus légère, sans rien stocker de plus en base.
 *
 *   1. `apercuFlou()` — la miniature de quelques pixels posée sous l'image
 *      pendant son chargement (technique dite « LQIP »). C'est elle qui donne
 *      le flou qui se précise, cf. `components/ui/Photo.tsx`.
 *   2. `vignette()` — une largeur bornée pour les grilles de la console, qui
 *      affichent en 300 px des fichiers déposés en 4000.
 *
 * Pourquoi une dérivation d'URL plutôt qu'une colonne en base : les visuels
 * déjà enregistrés — plusieurs centaines — en bénéficient sans reprise ni
 * migration, et un média remplacé n'a pas d'aperçu à régénérer. Le coût est
 * d'une requête supplémentaire par image, de l'ordre de 300 octets, servie par
 * le même CDN que l'originale et mise en cache aussi longtemps qu'elle.
 *
 * Module SANS import serveur : il est lu par `Photo` (composant client) autant
 * que par les pages de la console.
 */
import { estOptimisable } from "@/lib/medias";

/**
 * Adresse de diffusion Cloudinary, découpée avant / après le point d'insertion
 * des transformations.
 *
 * Cloudinary chaîne les transformations par `/` : insérer un segment juste
 * après `/image/upload/` reste valide même si l'URL en portait déjà un — cas
 * d'un média externe saisi à la main dans la console.
 */
const CLOUDINARY = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i;

/** Photographies de démonstration : imgix accepte ses réglages en query. */
const UNSPLASH = "images.unsplash.com";

/**
 * Chemin de l'optimiseur intégré. Valeur par défaut de `images.path`
 * (next.config.mjs ne la redéfinit pas) ; la citer ici évite d'importer la
 * configuration de Next dans un composant client.
 */
const OPTIMISEUR = "/_next/image";

/**
 * Largeur et qualité de l'aperçu.
 *
 * ⚠️ Les deux valeurs sont déclarées dans `images` de `next.config.mjs`
 * (`imageSizes` et `qualities`) : l'optimiseur REFUSE en production toute
 * largeur ou qualité hors liste, avec un 400 qui laisserait l'aperçu vide.
 */
const APERCU_LARGEUR = 16;
const APERCU_QUALITE = 10;

/** Est-ce une adresse absolue vers un hôte tiers ? */
const hote = (src: string): string | null =>
  /^https?:\/\/([^/?#]+)/i.exec(src)?.[1].split(":")[0].toLowerCase() ?? null;

/**
 * Miniature floutée d'un visuel, à afficher pendant son chargement.
 *
 * Renvoie `null` quand aucune variante légère n'est dérivable — source déjà
 * embarquée (`data:`), ou hôte que ni Cloudinary ni l'optimiseur ne savent
 * traiter. L'appelant retombe alors sur un aplat, pas sur l'image entière :
 * charger l'originale pour la flouter reviendrait à la charger deux fois.
 */
export function apercuFlou(src: string): string | null {
  if (!src || src.startsWith("data:")) return null;

  // Notre stockage : la transformation est faite par le CDN de Cloudinary,
  // sans passer par l'optimiseur — l'originale, qui pèse jusqu'à 5 Mo, n'est
  // même pas rapatriée côté serveur.
  const cloudinary = CLOUDINARY.exec(src);
  if (cloudinary) {
    return `${cloudinary[1]}w_${APERCU_LARGEUR},e_blur:1200,q_${APERCU_QUALITE},f_auto/${cloudinary[2]}`;
  }

  // Unsplash sert ses images derrière imgix : les réglages voyagent en query,
  // et ceux déjà présents (auto=format, fit=crop) restent valables.
  if (hote(src) === UNSPLASH) {
    try {
      const url = new URL(src);
      url.searchParams.set("w", String(APERCU_LARGEUR));
      url.searchParams.set("q", String(APERCU_QUALITE));
      url.searchParams.set("blur", "40");
      return url.toString();
    } catch {
      return null;
    }
  }

  // Reste les fichiers servis par l'application (`/api/medias/<id>`, `/public`)
  // et le CDN du Projet : l'optimiseur intégré sait les réduire, et le résultat
  // est mis en cache aussi durablement que n'importe quelle autre variante.
  if (!estOptimisable(src)) return null;

  return `${OPTIMISEUR}?url=${encodeURIComponent(src)}&w=${APERCU_LARGEUR}&q=${APERCU_QUALITE}`;
}

/**
 * Même visuel, borné en largeur — pour les vignettes de la console.
 *
 * Ces écrans posent des balises `img` nues, sans `next/image` : la rédaction y
 * veut voir le fichier tel qu'il a été déposé, pas une transformation. Rien
 * n'oblige pour autant à télécharger 4 Mo pour remplir un cadre de 300 px, et
 * `q_auto` laisse Cloudinary choisir le taux de compression qui tient sans
 * dégrader visiblement.
 *
 * L'URL est renvoyée INCHANGÉE hors Cloudinary : un média externe n'est pas
 * le nôtre, et rien ne garantit que son hôte accepte des paramètres.
 */
export function vignette(src: string, largeur: number): string {
  const cloudinary = CLOUDINARY.exec(src);
  if (!cloudinary) return src;
  return `${cloudinary[1]}w_${largeur},c_limit,q_auto,f_auto/${cloudinary[2]}`;
}
