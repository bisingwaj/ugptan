import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { ADMIN_BASE, ADMIN_LOGIN, ADMIN_SET_PASSWORD, NEXT_PARAM } from "@/lib/admin";
/* `cheminActuel` et sa table vivent dans `lib/routes.ts`, avec les chemins
   publics dont ils dérivent : le rendu s'en sert aussi, pour rattraper les
   liens saisis en console avant le renommage. Ce module n'a aucune dépendance
   d'exécution, il peut donc être lu depuis la middleware. */
import { cheminActuel, navKeysPourChemin } from "@/lib/routes";
import { COOKIE_ACCES } from "@/lib/reglages/code";
import { etatPourProxy, type EtatProxy } from "@/lib/reglages/edge";
import { ficheExiste } from "@/lib/url/existence";
import { estVarianteFiltree, varianteFiltree } from "@/lib/url/listes";

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

  /* --- Pages internes servies depuis le segment public ---------------------
   *
   * Le plan de tournage (`/<langue>/media`) n'est pas une page du site : c'est
   * un document de travail des équipes de production. Sa page porte déjà sa
   * garde — elle appelle `getCurrentUser()` et lève `notFound()` sans session,
   * et c'est elle qui fait autorité.
   *
   * ⚠️ Cette garde-là protège le CONTENU, pas le STATUT. Mesuré sur un serveur
   * de production : sans session, le corps servi est bien l'écran d'introuvable
   * — aucune trace du plan — mais la réponse part en **200**, car la coquille et
   * les métadonnées sont diffusées avant que la garde n'ait fini d'interroger la
   * session. L'adresse répondait donc « rien à voir ici » avec le statut d'une
   * page qui existe, et son titre annonçait « Plan médias ».
   *
   * Bloquer ici corrige les deux : le proxy s'exécute AVANT tout rendu, il n'y a
   * donc rien à diffuser, et le 404 est franc.
   *
   * Contrôle OPTIMISTE, comme pour la console (voir plus haut) : on regarde si
   * un cookie de session EXISTE, sans le valider. Il ne fait que bloquer les
   * visiteurs anonymes ; c'est la page qui vérifie réellement. Un cookie périmé
   * passe ici et se fait refuser là.
   */
  if (/^\/(?:fr|en)\/media\/?$/.test(pathname) && !getSessionCookie(req)) {
    return new NextResponse(null, { status: 404 });
  }

  /* --- Écran de maintenance lu par le proxy lui-même ----------------------
   *
   * Pendant une fermeture, le proxy va CHERCHER l'écran de maintenance pour le
   * servir en 503 (cf. `servirEn503`). Cette requête interne repasse par ici :
   * sans ce laissez-passer, `/maintenance/fr` serait renvoyé vers
   * `/fr/maintenance/fr` (préfixe de langue), puis refermé à son tour. Elle
   * porte la clef partagée de l'hébergement, qu'aucun visiteur ne connaît ;
   * sans elle, l'adresse reste traitée comme n'importe quelle autre.
   */
  if (pathname.startsWith("/maintenance/") && estRequeteInterne(req)) return;

  // --- Site public ---------------------------------------------------------
  /* Deux corrections possibles, traitées ensemble pour n'imposer qu'un seul
     aller-retour : le préfixe de langue absent, et l'ancien chemin français. */
  const locale = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  const reste = locale ? pathname.slice(locale.length + 1) : pathname === "/" ? "" : pathname;
  const actuel = cheminActuel(reste);
  const ancien = actuel !== reste;

  /* Adresse déjà correcte dans les deux dimensions : il ne reste qu'à vérifier
     que le site — puis la page elle-même — est ouvert. */
  if (locale && !ancien) {
    /* L'adresse technique d'une variante filtrée n'est pas une page publique :
       elle n'existe que comme cible de la réécriture ci-dessous, qui ne repasse
       pas par ce proxy. Demandée telle quelle, elle répond 404 — sinon elle
       doublerait la liste sous une seconde adresse. */
    if (estVarianteFiltree(actuel)) return new NextResponse(null, { status: 404 });

    /* La fermeture passe AVANT la réécriture : une page coupée l'est pour toutes
       ses variantes, et `navKeysPourChemin` raisonne sur le chemin public. */
    return (
      (await fermeture(req, locale, actuel)) ??
      (await ficheIntrouvable(req, locale, actuel)) ??
      listeFiltree(req, locale, actuel)
    );
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${locale ?? defaultLocale}${actuel}`;
  /* 308 dès qu'une ancienne adresse est en jeu : elle ne reviendra pas, et le
     dire permanent transfère le référencement. Le simple ajout du préfixe de
     langue reste un 307 — la langue servie peut changer, l'adresse sans
     préfixe n'est pas périmée pour autant. */
  return NextResponse.redirect(url, ancien ? 308 : 307);
}

/**
 * Site fermé au public, ou page coupée individuellement : substitution de
 * l'écran qui convient.
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
 * RÉÉCRITURE et non redirection dans les deux cas : l'adresse demandée reste
 * affichée. Pour la fermeture générale, la personne qui saisit le code retombe
 * sur la page qu'elle visait, dont le chemin est passé à l'écran. Pour une
 * page coupée, `/construction` vit DANS le segment `[lang]` — l'en-tête et le
 * pied de page restent donc en place, seul le contenu change ; rien à
 * transmettre, le message y est générique.
 */
async function fermeture(req: NextRequest, locale: string, chemin: string) {
  const etat = await etatPourProxy(req.nextUrl.origin);

  if (etat.ferme) {
    /* Comparaison simple : l'empreinte est un condensé de 64 caractères,
       jamais dérivable du code, et une attaque par mesure de temps à travers
       le réseau n'a pas de sens à cette échelle. La signature, elle, est
       faite côté serveur (cf. lib/reglages/maintenance.ts). */
    const jeton = req.cookies.get(COOKIE_ACCES)?.value;
    if (!(jeton && etat.empreinte && jeton === etat.empreinte)) {
      const url = req.nextUrl.clone();
      url.pathname = `/maintenance/${locale}`;
      url.search = "";
      url.searchParams.set("depuis", `${req.nextUrl.pathname}${req.nextUrl.search}`);

      return (await servirEn503(req, url, etat)) ?? NextResponse.rewrite(url);
    }
  }

  /* Site ouvert (ou laissez-passer valide) : reste à vérifier que LA PAGE
     demandée n'est pas coupée à elle seule. Couper une section coupe aussi
     ses sous-pages, d'où le préfixe testé par `navKeysPourChemin` ; et une
     page désactivable peut en contenir une autre (« Provinces » sous « Vue
     d'ensemble »), d'où le test de chacune. */
  if (navKeysPourChemin(chemin).some((cle) => etat.pagesFermees.includes(cle))) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/construction`;
    url.search = "";
    return NextResponse.rewrite(url);
  }
}

/**
 * L'écran de maintenance, servi avec le statut **503** et un `Retry-After`.
 *
 * ─── Pourquoi 503 ───────────────────────────────────────────────────────────
 *
 * C'est la seule réponse qui dise aux moteurs « momentanément indisponible,
 * repassez » : ils gardent alors l'index tel quel. Un 200 leur présente l'écran
 * de fermeture comme le NOUVEAU contenu de chaque page ; et le `noindex` qui
 * l'accompagnait jusqu'ici était pire encore, puisqu'une fermeture de quelques
 * jours aurait fait sortir le site entier de l'index.
 *
 * ─── Pourquoi une réponse directe, et non une réécriture ────────────────────
 *
 * La tentative précédente posait le 503 sur la RÉÉCRITURE
 * (`NextResponse.rewrite(url, { status: 503 })`). En production, la plateforme
 * a traité cette réécriture en 5xx comme une panne du déploiement et servi son
 * propre écran « deployment unavailable » à la place de la page (27 août 2026,
 * commit 6fd3086) : une réécriture délègue la réponse à la plateforme, qui en
 * interprète le statut. Ici, le proxy produit LUI-MÊME la réponse complète —
 * c'est la forme que la documentation de Next prévoit pour un proxy qui fixe
 * son statut (« producing a response ») — en allant lire le HTML de l'écran
 * sur sa propre origine, comme il lit déjà l'état sur `/api/site/etat`.
 *
 * ⚠️ NON VÉRIFIÉ SUR VERCEL à la date de ce changement : rien ne permet de
 * tester une fermeture en local sans fermer la base partagée. À contrôler à la
 * première fermeture (`curl -I` sur une page : 503, `retry-after`, et l'écran
 * de maintenance dans le corps). Si la plateforme interceptait aussi cette
 * forme, poser `MAINTENANCE_SANS_503=1` dans l'environnement rétablit la
 * réécriture en 200, sans toucher au code.
 *
 * ─── Ce qui reste servi par réécriture (200) ────────────────────────────────
 *
 *   · les POST : ce sont les actions serveur de l'écran (saisie du code). Le
 *     protocole Flight exige que le corps atteigne la page qui définit
 *     l'action, et la réponse est lue par le formulaire, pas par un moteur ;
 *   · les requêtes RSC des navigations client, que le routeur doit pouvoir
 *     suivre ;
 *   · toute lecture interne qui échoue (route muette, redirection parce que le
 *     site vient de rouvrir, réponse non HTML) : l'écran doit s'afficher, quel
 *     que soit son statut.
 *
 * Le laissez-passer par cookie est vérifié AVANT d'arriver ici : un porteur du
 * code ne voit jamais ce 503.
 */
async function servirEn503(req: NextRequest, cible: URL, etat: EtatProxy): Promise<NextResponse | null> {
  if (process.env.MAINTENANCE_SANS_503 === "1") return null;
  if (req.method !== "GET" && req.method !== "HEAD") return null;
  if (req.headers.has("rsc") || req.headers.has("next-router-prefetch")) return null;

  const clef = process.env.BETTER_AUTH_SECRET;
  if (!clef) return null;

  try {
    const reponse = await fetch(cible, {
      headers: {
        [ENTETE_INTERNE]: clef,
        accept: "text/html",
        // La langue du visiteur, au cas où l'écran la consulterait un jour.
        "accept-language": req.headers.get("accept-language") ?? "",
      },
      cache: "no-store",
      // Une redirection signifie que l'écran ne s'applique plus (site rouvert
      // entre-temps) : on ne la suit pas, la réécriture s'en chargera.
      redirect: "manual",
    });
    const type = reponse.headers.get("content-type") ?? "";
    if (reponse.status !== 200 || !type.includes("text/html")) return null;

    return new NextResponse(req.method === "HEAD" ? null : reponse.body, {
      status: 503,
      headers: {
        "content-type": type,
        "retry-after": String(delaiReouverture(etat.reouverture)),
        // Jamais en cache : la réouverture doit se voir à la requête suivante.
        "cache-control": "no-store",
      },
    });
  } catch {
    return null;
  }
}

/**
 * Secondes à annoncer dans `Retry-After`. L'heure de réouverture saisie en
 * console si elle est future, bornée entre cinq minutes (inutile de faire
 * repasser un robot plus tôt) et un jour (au-delà, l'heure annoncée vaut moins
 * qu'un nouveau passage) ; une heure à défaut.
 */
function delaiReouverture(reouverture: string | null | undefined): number {
  const cible = reouverture ? Date.parse(reouverture) : Number.NaN;
  if (!Number.isFinite(cible)) return 3600;
  const secondes = Math.ceil((cible - Date.now()) / 1000);
  return Math.min(86_400, Math.max(300, secondes));
}

/** En-tête porteur de la clef partagée, le même que pour `/api/site/etat`. */
const ENTETE_INTERNE = "x-ugptn-etat";

/** Requête émise par le proxy lui-même, reconnue à la clef partagée. */
function estRequeteInterne(req: NextRequest): boolean {
  const clef = process.env.BETTER_AUTH_SECRET;
  return Boolean(clef) && req.headers.get(ENTETE_INTERNE) === clef;
}

/**
 * Fiche de détail (article, événement, album, document) qui n'existe pas :
 * vrai **404**, tranché avant tout rendu.
 *
 * Sans ce contrôle, la page appelait bien `notFound()`, mais sous la frontière
 * Suspense de son écran de chargement — celui de la section, ou celui du
 * segment `[lang]` : la coquille était déjà partie avec un 200, et le statut ne
 * pouvait plus changer (cf. la documentation de `loading.js`, « Status
 * Codes »). Le détail, et le choix d'une liste volontairement large, sont dans
 * src/app/api/site/adresses/route.ts et lib/url/existence.ts.
 *
 * RÉÉCRITURE vers une adresse qu'aucune route ne sert, plutôt qu'une réponse
 * vide : Next y répond lui-même 404, avec l'écran « Page introuvable » du site
 * (app/not-found.tsx), et l'adresse demandée reste affichée. Aucun statut
 * n'est posé sur la réécriture : c'est Next qui le fixe, ce qui écarte le
 * piège décrit plus haut pour le 503.
 */
async function ficheIntrouvable(req: NextRequest, locale: string, chemin: string) {
  if ((await ficheExiste(req.nextUrl.origin, chemin)) !== false) return;
  const url = req.nextUrl.clone();
  // Deux segments sous la langue, dont un tiret bas que `slugify` ne produit
  // jamais : aucune route présente ou future du site ne peut y répondre.
  url.pathname = `/${locale}/_introuvable/_`;
  url.search = "";
  return NextResponse.rewrite(url);
}

/**
 * Liste publique demandée AVEC un filtre : réécriture vers sa variante rendue
 * à la demande, l'adresse affichée restant celle du visiteur.
 *
 * C'est ce qui permet à la version sans paramètre — de loin la plus demandée —
 * d'être prérendue et servie par le CDN : elle ne lit plus `searchParams`, la
 * variante filtrée le fait à sa place. Le dispositif complet, et le choix de
 * garder le filtrage côté serveur, sont expliqués dans lib/url/listes.ts.
 *
 * Les requêtes RSC des navigations client (liens de filtre, pagination)
 * passent par ici comme les autres : le routeur suit la réécriture.
 */
function listeFiltree(req: NextRequest, locale: string, chemin: string) {
  const cible = varianteFiltree(chemin, req.nextUrl.searchParams);
  if (!cible) return;
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${cible}`;
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
