/**
 * Export de la liste d'abonnés, en CSV ou en classeur Excel.
 *
 * ⚠️ ROUTE PROTÉGÉE, et elle doit l'être ICI : `src/proxy.ts` ignore `/api`
 * (cf. son matcher), donc aucune barrière ne se trouve en amont. La réponse
 * contient des adresses personnelles ; c'est le point du système où elles
 * quittent la base.
 *
 * L'export reprend EXACTEMENT la sélection affichée dans la console : mêmes
 * filtres, même tri, même colonnes, parce que la requête est construite par le
 * même module (cf. lib/newsletter/query.ts). Un administrateur qui filtre puis
 * exporte obtient ce qu'il voit à l'écran.
 */
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { toCsv } from "@/lib/newsletter/csv";
import { toXlsx } from "@/lib/newsletter/xlsx";
import {
  CHAMPS_LISTE,
  COLONNES_EXPORT,
  ligneExport,
  lireFiltres,
  whereAbonnes,
  type LigneAbonne,
} from "@/lib/newsletter/query";

/**
 * Plafond de sécurité. Une liste d'abonnés d'un site institutionnel n'atteint
 * pas cet ordre de grandeur ; la borne existe pour qu'une requête ne puisse pas
 * charger une table entière en mémoire si elle enflait un jour. Le
 * dépassement est journalisé plutôt que silencieux.
 */
const MAX_LIGNES = 50_000;

/** Date du jour à Kinshasa, pour le nom du fichier téléchargé. */
const horodatage = (): string =>
  new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Africa/Kinshasa",
  }).format(new Date());

export async function GET(request: Request) {
  const utilisateur = await getCurrentUser();
  if (!utilisateur) {
    return new Response("Authentification requise.", { status: 401 });
  }
  if (!can(utilisateur, "newsletter")) {
    return new Response("Droits insuffisants.", { status: 403 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  const filtres = lireFiltres({
    q: url.searchParams.get("q") ?? undefined,
    statut: url.searchParams.get("statut") ?? undefined,
    langue: url.searchParams.get("langue") ?? undefined,
    source: url.searchParams.get("source") ?? undefined,
  });

  let abonnes: LigneAbonne[];
  try {
    abonnes = await db().newsletterSubscriber.findMany({
      where: whereAbonnes(filtres),
      select: CHAMPS_LISTE,
      orderBy: { subscribedAt: "desc" },
      take: MAX_LIGNES,
    });
  } catch (error) {
    console.error("[newsletter] export impossible", error);
    return new Response("Service indisponible.", { status: 503 });
  }

  if (abonnes.length === MAX_LIGNES) {
    console.warn(`[newsletter] export tronqué à ${MAX_LIGNES} lignes par ${utilisateur.email}.`);
  }

  // Trace d'accès : l'export d'un fichier d'adresses est l'opération la plus
  // sensible du module, elle doit se retrouver dans le journal du serveur.
  console.info(
    `[newsletter] export ${format.toUpperCase()} de ${abonnes.length} adresse(s) par ${utilisateur.email}.`,
  );

  const lignes = abonnes.map(ligneExport);
  const nom = `abonnes-newsletter-${horodatage()}.${format}`;

  const entetes = {
    // Le fichier est un instantané nominatif : il ne doit être conservé ni par
    // le navigateur, ni par un intermédiaire.
    "Cache-Control": "no-store, private",
    "Content-Disposition": `attachment; filename="${nom}"`,
    "X-Content-Type-Options": "nosniff",
  };

  if (format === "xlsx") {
    const classeur = toXlsx(COLONNES_EXPORT, lignes);
    return new Response(classeur, {
      headers: {
        ...entetes,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Length": String(classeur.byteLength),
      },
    });
  }

  return new Response(toCsv(COLONNES_EXPORT, lignes), {
    headers: {
      ...entetes,
      // `charset=utf-8` en plus de la marque d'ordre des octets : les deux
      // visent des lecteurs différents (le navigateur, puis le tableur).
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
