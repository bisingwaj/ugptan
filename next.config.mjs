/** @type {import('next').NextConfig} */

// En-têtes de sécurité appliqués à toutes les routes. Volontairement SANS
// Content-Security-Policy stricte : le site intègre des iframes YouTube, des
// images Unsplash et Google Fonts — une CSP mal calibrée les casserait.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
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
  ],
  experimental: {
    serverActions: {
      // Le CMS d'actualités téléverse ses visuels par server action, et la
      // limite par défaut (1 Mo) refuserait une photographie ordinaire. Le
      // plafond applicatif reste plus bas (5 Mo, cf. src/lib/medias.ts) : cette
      // valeur laisse la marge du surcoût d'encodage multipart, elle ne
      // l'autorise pas.
      bodySizeLimit: "8mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Photographie de démonstration servie depuis Unsplash ; basculer vers le CDN en production.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.ugptn.cd" },
    ],
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
