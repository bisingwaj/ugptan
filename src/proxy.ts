import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { ADMIN_BASE, ADMIN_LOGIN, ADMIN_SET_PASSWORD, NEXT_PARAM } from "@/lib/admin";
/* `cheminActuel` et sa table vivent dans `lib/routes.ts`, avec les chemins
   publics dont ils dérivent : le rendu s'en sert aussi, pour rattraper les
   liens saisis en console avant le renommage. Ce module n'a aucune dépendance
   d'exécution, il peut donc être lu depuis la middleware. */
import { cheminActuel } from "@/lib/routes";
import { COOKIE_ACCES } from "@/lib/reglages/code";
import { etatPourProxy } from "@/lib/reglages/edge";

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
  /* Deux corrections possibles, traitées ensemble pour n'imposer qu'un seul
     aller-retour : le préfixe de langue absent, et l'ancien chemin français. */
  const locale = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  const reste = locale ? pathname.slice(locale.length + 1) : pathname === "/" ? "" : pathname;
  const actuel = cheminActuel(reste);
  const ancien = actuel !== reste;

  /* Adresse déjà correcte dans les deux dimensions : il ne reste qu'à vérifier
     que le site est ouvert. */
  if (locale && !ancien) return fermeture(req, locale);

  const url = req.nextUrl.clone();
  url.pathname = `/${locale ?? defaultLocale}${actuel}`;
  /* 308 dès qu'une ancienne adresse est en jeu : elle ne reviendra pas, et le
     dire permanent transfère le référencement. Le simple ajout du préfixe de
     langue reste un 307 — la langue servie peut changer, l'adresse sans
     préfixe n'est pas périmée pour autant. */
  return NextResponse.redirect(url, ancien ? 308 : 307);
}

/**
 * Site fermé au public : substitution de l'écran de maintenance.
 *
 * ⚠️ POURQUOI ICI, ET NON DANS LE LAYOUT. La première version décidait au
 * rendu. Elle marchait sur les pages rendues à la demande et ÉCHOUAIT sur les
 * cent pages prérendues, pour deux raisons qui se cumulaient : leur HTML est
 * figé à la construction, où l'état lu peut être faux ; et leur régénération
 * s'exécute hors requête, où lire un cookie est interdit, si bien qu'elle
 * échouait en silence et que Vercel continuait de servir la page ouverte.
 * Constaté en production le 27 août 2026 : `/fr/news` fermait, `/fr` non.
 *
 * Le proxy, lui, s'exécute avant tout cache et sur chaque requête. C'est le
 * seul endroit d'où une page prérendue peut être retirée au public.
 *
 * RÉÉCRITURE et non redirection : l'adresse demandée reste affichée, donc la
 * personne qui saisit le code retombe sur la page qu'elle visait. Le chemin
 * d'origine est passé à l'écran, qui le rend au formulaire.
 */
async function fermeture(req: NextRequest, locale: string) {
  const etat = await etatPourProxy(req.nextUrl.origin);
  if (!etat.ferme) return;

  /* Comparaison simple : l'empreinte est un condensé de 64 caractères, jamais
     dérivable du code, et une attaque par mesure de temps à travers le réseau
     n'a pas de sens à cette échelle. La signature, elle, est faite côté serveur
     (cf. lib/reglages/maintenance.ts). */
  const jeton = req.cookies.get(COOKIE_ACCES)?.value;
  if (jeton && etat.empreinte && jeton === etat.empreinte) return;

  const url = req.nextUrl.clone();
  url.pathname = `/maintenance/${locale}`;
  url.search = "";
  url.searchParams.set("depuis", `${req.nextUrl.pathname}${req.nextUrl.search}`);

  /* ⚠️ PAS de statut 503 ici. Une réécriture assortie d'un 5xx est interceptée
     par la plateforme, qui remplace la page par son propre écran « deployment
     unavailable » : essayé le 27 août 2026, le site entier a servi cette page.
     La réponse reste donc un 200, et c'est le `noindex` de l'écran de
     maintenance qui tient les moteurs à l'écart. */
  return NextResponse.rewrite(url);
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
