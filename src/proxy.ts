import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { ADMIN_BASE, ADMIN_LOGIN, ADMIN_SET_PASSWORD, NEXT_PARAM } from "@/lib/admin";

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
    // Chaque action porte son propre garde — cf. lib/auth/guard.ts.
    if (req.method !== "GET" && req.method !== "HEAD") return;

    /* Les deux pages du sous-arbre ouvertes sans session : l'écran de connexion,
       et celui où l'on définit son mot de passe depuis le lien reçu par e-mail
       (son autorisation tient au jeton de l'URL, que Better Auth vérifie).
       Elles passent AVANT tout examen du cookie — voir pourquoi juste après. */
    if (
      pathname === ADMIN_LOGIN ||
      pathname === `${ADMIN_LOGIN}/` ||
      pathname === ADMIN_SET_PASSWORD ||
      pathname === `${ADMIN_SET_PASSWORD}/`
    ) {
      return;
    }

    /* Tri OPTIMISTE, tel que le recommande Better Auth pour une middleware : on
       regarde si le cookie de session EXISTE, sans le valider ni toucher la
       base. Il évite un aller-retour vers une page qui redirigerait de toute
       façon ; il ne PROUVE rien. La vérification qui fait autorité est
       `getSession`, appelée par les gardes de chaque layout, page et action
       (cf. lib/auth/guard.ts) — indispensable, d'autant que tout chemin
       contenant un point échappe au matcher ci-dessous.

       ⚠️ Ce cookie ne sert donc QU'À BLOQUER, jamais à faire sortir de l'écran
       de connexion. La version précédente y renvoyait vers le tableau de bord
       dès qu'un cookie était présent, et un cookie PÉRIMÉ (session révoquée,
       compte supprimé, base réinitialisée) suffisait alors à faire boucler les
       deux pages indéfiniment : le proxy poussait vers le tableau de bord, le
       garde de page renvoyait vers la connexion, sans fin. C'est la page de
       connexion qui redirige vers le tableau de bord, après vérification en
       base — une seule décision, prise au seul endroit qui sait. */
    if (getSessionCookie(req)) return;

    // Aucun cookie : inutile de rendre la page, on renvoie à la connexion en
    // gardant en mémoire la destination initiale.
    return redirectTo(req, ADMIN_LOGIN, `${pathname}${req.nextUrl.search}`);
  }

  // --- Site public ---------------------------------------------------------
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

function redirectTo(req: NextRequest, pathname: string, next?: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  // `next` est relu par `safeAdminRedirect`, qui refuse toute destination hors
  // de la console : le paramètre ne peut pas servir de redirection ouverte.
  if (next) url.searchParams.set(NEXT_PARAM, next);
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
  // contenant un point échappe au proxy — d'où les gardes `requireAdmin()` /
  // `requirePermission()` dans chaque layout, page et action de la console, qui
  // restent la barrière de référence.
  matcher: ["/((?!_next|api|favicon.ico|opengraph-image|twitter-image|.*\\..*).*)"],
};
