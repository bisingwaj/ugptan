/** @type {import('next').NextConfig} */

/**
 * Hôtes d'intégration vidéo autorisés.
 *
 * ⚠️ DOIT rester aligné sur `ALLOWED_FRAME_HOSTS` de src/lib/html/sanitize.ts,
 * qui décide quels `<iframe>` survivent à l'assainissement du corps des
 * articles. Les deux listes se répondent : l'assainisseur empêche d'ÉCRIRE une
 * intégration vers un autre hôte, la CSP empêche le navigateur de la CHARGER si
 * une s'y glisse malgré tout. Le même contrôle, à deux étages.
 */
const HOTES_VIDEO = [
  "https://www.youtube-nocookie.com",
  "https://www.youtube.com",
  "https://player.vimeo.com",
  "https://www.dailymotion.com",
  "https://geo.dailymotion.com",
];

/** Hôtes d'images distantes — miroir de `images.remotePatterns` ci-dessous. */
const HOTES_IMAGES = [
  "https://res.cloudinary.com",
  "https://images.unsplash.com",
  "https://cdn.ugptn.cd",
  // Vignettes des vidéos YouTube (cf. src/lib/actus/video.ts).
  "https://i.ytimg.com",
];

/**
 * Politique de sécurité du contenu.
 *
 * ─── Ce qu'elle protège réellement, et ce qu'elle ne protège pas ────────────
 *
 * `script-src` porte `'unsafe-inline'`, et il faut le dire franchement : cette
 * CSP n'arrête donc PAS un script injecté en ligne. Next place son amorce
 * d'hydratation et ses charges utiles RSC dans des balises en ligne ; les en
 * retirer imposerait un nonce par requête, donc un rendu dynamique de CHAQUE
 * page, ce qui supprimerait la génération statique dont vit ce site.
 *
 * Ce qu'elle arrête malgré cela, et qui compte :
 *
 *   · `default-src`/`connect-src 'self'` — un script injecté ne peut plus
 *     EXFILTRER : ni requête, ni image, ni balise vers un domaine tiers. C'est
 *     la moitié utile d'une attaque par injection qui tombe ;
 *   · `script-src 'self'` — aucun script EXTERNE ne se charge, quand bien même
 *     une balise `<script src>` serait injectée ;
 *   · `base-uri 'self'` — bloque l'injection d'une balise `<base>`, qui
 *     détourne d'un coup toutes les URL relatives de la page ;
 *   · `form-action 'self'` — un formulaire injecté ne peut pas poster les
 *     identifiants de la console vers un serveur tiers ;
 *   · `object-src 'none'` — plus de `<object>`/`<embed>`, vecteurs hérités ;
 *   · `frame-ancestors 'self'` — anti-détournement de clic, et la version
 *     moderne de `X-Frame-Options`, qui reste pour les vieux navigateurs.
 *
 * `'unsafe-eval'` n'est admis QU'EN DÉVELOPPEMENT : le rechargement à chaud de
 * Next en dépend, la production non.
 */
const csp = (dev) =>
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    // Le site compose une large part de sa mise en page en styles en ligne.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${HOTES_IMAGES.join(" ")}`,
    // Polices auto-hébergées depuis la bascule vers next/font : plus aucun
    // hôte tiers n'a à figurer ici (cf. src/lib/fonts.ts).
    "font-src 'self'",
    // `blob:` : les extraits vidéo de la galerie sont lus depuis un objet local.
    "media-src 'self' blob: https://res.cloudinary.com",
    `frame-src 'self' ${HOTES_VIDEO.join(" ")}`,
    // `ws:` en développement seulement : c'est le canal du rechargement à chaud.
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    /* ⚠️ JAMAIS en développement. Cette directive demande au navigateur de
       réécrire en `https` toute requête `http` de la page — y compris vers
       `http://localhost`. Chrome et les navigateurs dérivés exemptent
       localhost ; Safari, non : il tentait donc de charger les feuilles de
       style et les scripts sur `https://localhost:3003`, où rien n'écoute, et
       n'affichait plus qu'un squelette HTML nu. Le symptôme est déroutant parce
       qu'il ne touche qu'un navigateur, et que le serveur, lui, répond
       correctement à chaque ressource prise isolément. */
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

// En-têtes de sécurité appliqués à toutes les routes.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp(process.env.NODE_ENV !== "production") },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  /* Isole le contexte de navigation. Une page ouverte depuis un autre site
     n'obtient plus de référence `window.opener` vers la nôtre : c'est ce qui
     ferme le détournement d'onglet (une page tierce qui réécrit l'adresse de
     l'onglet ouvrant vers une fausse page de connexion) et la famille des
     fuites par canal auxiliaire entre fenêtres.

     `same-origin-allow-popups` et non `same-origin` : les liens sortants du
     site — DigiProcure au premier chef — s'ouvrent dans un nouvel onglet, et la
     valeur stricte couperait aussi ce sens-là sans rien protéger de plus, nos
     liens portant déjà `rel="noopener"`. */
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  /* Un document de ce domaine n'est plus une origine partagée avec les autres
     sous-domaines : une faille sur un sous-domaine voisin ne donne plus accès
     au contexte de celui-ci. */
  { key: "Origin-Agent-Cluster", value: "?1" },
  /* Hérité de Flash et des lecteurs PDF, mais toujours lu par certains d'entre
     eux : aucune politique inter-domaines n'est publiée par ce site. */
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pastille de développement de Next masquée : elle se superpose au coin de
  // l'écran et gêne la relecture des maquettes. Sans effet sur la production,
  // où l'indicateur n'apparaît jamais.
  devIndicators: false,
  // Laissés hors du bundle serveur, et non bundlés par Turbopack.
  // `src/lib/db.ts` fait `neonConfig.webSocketConstructor = ws` : si le bundler
  // duplique @neondatabase/serverless, l'adaptateur Prisma en obtient une autre
  // instance, l'affectation n'atteint pas celle qui ouvre la socket, et toute
  // requête échoue instantanément sur un ErrorEvent WebSocket. `ws` s'appuie en
  // outre sur des internes Node qui ne survivent pas au bundling.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-neon",
    "@neondatabase/serverless",
    "ws",
    // Ouvre lui-même ses sockets TLS et charge ses modules par chemin : bundlé,
    // il perd la résolution de ses dépendances internes.
    "nodemailer",
    // Même raison : le SDK Cloudinary ouvre ses propres connexions et charge
    // ses modules dynamiquement (cf. src/lib/cloudinary.ts).
    "cloudinary",
  ],
  experimental: {
    serverActions: {
      // La console téléverse visuels et documents par server action, et la
      // limite par défaut (1 Mo) refuserait une photographie ordinaire. Les
      // plafonds applicatifs restent plus bas (5 Mo pour une image, 10 Mo pour
      // un document, cf. src/lib/medias.ts) : cette valeur laisse la marge du
      // surcoût d'encodage multipart, elle ne l'autorise pas.
      bodySizeLimit: "14mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Stockage des fichiers téléversés depuis la console (cf. src/lib/cloudinary.ts).
      // Doit rester aligné sur HOTES_OPTIMISABLES de src/lib/medias.ts, sans
      // quoi l'optimiseur refuse une source qu'on lui annonce optimisable.
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Photographie de démonstration servie depuis Unsplash ; basculer vers le CDN en production.
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.ugptn.cd" },
    ],
    // Les listes par défaut, plus une entrée de 16 px : c'est la largeur des
    // aperçus flous posés sous les images pendant leur chargement
    // (cf. `apercuFlou()` dans src/lib/images.ts). Hors liste, l'optimiseur
    // répond 400 et l'aperçu reste vide.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Même raison pour la qualité : Next 16 n'autorise plus que les valeurs
    // déclarées ici, et 75 seule par défaut. 10 ne sert qu'aux aperçus, dont
    // le flou dissimule de toute façon la compression.
    qualities: [10, 75],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Console d'administration : le <meta robots> du layout ne couvre que le
      // HTML — cet en-tête couvre aussi les réponses non-HTML du sous-arbre.
      {
        source: "/7hj3nrpgaz6fjtw7/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      // Médias volumineux (vidéo du héros) : cache long côté navigateur/CDN.
      // Non-immutable → un fichier de même nom mis à jour se propage sous 30 j
      // (préférer un nom versionné, ex. hero-film-v2.mp4, pour un bust immédiat).
      {
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
