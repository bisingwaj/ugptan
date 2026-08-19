/**
 * Désabonnement en UN CLIC, au sens de la RFC 8058.
 *
 * ─── Pourquoi cette route existe, alors qu'une page de désabonnement existe ──
 *
 * Depuis février 2024, Gmail et Yahoo exigent des expéditeurs d'envois groupés
 * un désabonnement qui s'exécute SANS quitter la messagerie : le client de
 * messagerie affiche lui-même un bouton « Se désabonner », et son clic déclenche
 * une requête POST vers l'adresse annoncée dans l'en-tête `List-Unsubscribe`.
 * Un expéditeur qui ne le fournit pas voit ses messages classés en indésirables,
 * quelle que soit la qualité de son contenu.
 *
 * La page publique `/newsletter/unsubscribe` reste : elle sert le visiteur qui
 * suit le lien à la main. Cette route-ci sert la MACHINE.
 *
 * ⚠️ POST UNIQUEMENT, et c'est le point qui protège les abonnés. Les antivirus
 * de messagerie et les générateurs d'aperçu visitent les URL qu'ils trouvent,
 * mais en GET : une route qui désabonnerait sur GET viderait la liste toute
 * seule (c'est le raisonnement déjà tenu dans actions/newsletter.ts). Le GET est
 * donc redirigé vers la page, où un geste humain est demandé.
 */
import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/actions/newsletter";
import { SITE_URL } from "@/lib/site";

/** Le jeton voyage en paramètre d'URL : c'est lui que porte l'en-tête du message. */
const lireJeton = (url: string): string => new URL(url).searchParams.get("t")?.trim() ?? "";

export async function POST(request: Request) {
  const jeton = lireJeton(request.url);
  if (!jeton) {
    return new NextResponse("Jeton manquant.", { status: 400 });
  }

  const { code } = await unsubscribeByToken(jeton);

  /* Un jeton inconnu renvoie 200, comme un jeton valide. La RFC attend une
     réponse de succès, et distinguer les deux cas transformerait cette route en
     oracle : elle dirait à qui l'interroge si telle adresse figure sur la
     liste. Le journal serveur, lui, garde la distinction. */
  if (code === "server") {
    return new NextResponse("Erreur temporaire.", { status: 503 });
  }

  return new NextResponse(null, { status: 204 });
}

/** Un humain qui ouvre l'adresse à la main atterrit sur la page prévue pour lui. */
export function GET(request: Request) {
  const jeton = lireJeton(request.url);
  const cible = new URL("/fr/newsletter/unsubscribe", SITE_URL);
  if (jeton) cible.searchParams.set("t", jeton);
  return NextResponse.redirect(cible, 302);
}
