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
