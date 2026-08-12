import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_BASE, ADMIN_HOME } from "@/lib/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

const locales = ["fr", "en"];
const defaultLocale = "fr";

/** Verrou de la console + préfixe de locale sur toutes les routes publiques. */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Console d'administration -------------------------------------------
  // Traité AVANT l'i18n : sans cette branche, /<slug> partirait vers
  // /fr/<slug> (404), la console vivant hors du segment [lang].
  if (pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`)) {
    // Les POST (server actions) passent : les rediriger casserait le protocole
    // Flight (le corps serait re-posté sur une page où l'action n'existe pas).
    // Chaque action appelle `requireAdmin()` — cf. actions/admin-auth.ts.
    if (req.method !== "GET" && req.method !== "HEAD") return;

    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    const isIndex = pathname === ADMIN_BASE || pathname === `${ADMIN_BASE}/`;

    if (!session && !isIndex) return redirectTo(req, ADMIN_BASE);
    if (session && isIndex) return redirectTo(req, ADMIN_HOME);
    return;
  }

  // --- Site public ---------------------------------------------------------
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

function redirectTo(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API, any file with an extension (assets), and the
  // extensionless metadata routes (opengraph-image / twitter-image) — sinon la
  // redirection i18n renverrait le crawler vers /fr/opengraph-image (404).
  // robots.txt / sitemap.xml / manifest.webmanifest / icon.svg ont une extension
  // → déjà exclus par `.*\\..*`.
  // Le sous-arbre de la console passe par ce matcher (aucun point dans le slug)
  // et est traité dans la branche dédiée ci-dessus. Attention : tout chemin
  // contenant un point échappe au proxy — d'où le garde `requireAdmin()` dans
  // le layout de la console, qui reste la barrière de référence.
  matcher: ["/((?!_next|api|favicon.ico|opengraph-image|twitter-image|.*\\..*).*)"],
};
