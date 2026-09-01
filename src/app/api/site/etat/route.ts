/**
 * État de fermeture, à l'usage du PROXY et de lui seul.
 *
 * Le proxy s'exécute avant tout cache : c'est le seul endroit d'où l'on peut
 * retirer au public une page prérendue. Mais il tourne sur le moteur périphérique,
 * sans base ni `node:crypto` — d'où cette route, qui lit pour lui.
 *
 * ⚠️ Elle rend l'EMPREINTE attendue du laissez-passer, c'est-à-dire exactement
 * la valeur qu'un cookie doit présenter. La publier ouvrirait le site à qui la
 * recopie. Elle est donc close par la clef partagée de l'hébergement, et répond
 * 404 sans elle : une route qui existe mais se tait apprend moins qu'une route
 * qui refuse.
 */
import { NextResponse } from "next/server";
import { etatMaintenance, laissezPasser } from "@/lib/reglages/maintenance";

/** Jamais de cache : le proxy tient le sien, avec sa propre péremption. */
export const dynamic = "force-dynamic";

export async function GET(requete: Request): Promise<NextResponse> {
  const attendue = process.env.BETTER_AUTH_SECRET;
  if (!attendue || requete.headers.get("x-ugptn-etat") !== attendue) {
    return new NextResponse(null, { status: 404 });
  }

  const etat = await etatMaintenance();

  return NextResponse.json(
    {
      ferme: etat.ferme,
      empreinte: etat.ferme && etat.code ? laissezPasser(etat.code) : null,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
