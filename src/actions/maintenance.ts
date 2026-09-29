"use server";

/**
 * Ouverture du site fermé, par code à six chiffres. Action PUBLIQUE : aucune
 * session, aucun compte, et rien d'autre à faire que présenter le bon code.
 *
 * Trois précautions, dans cet ordre :
 *
 *   1. la forme est vérifiée avant tout, pour ne pas consommer un jeton du
 *      limiteur sur une saisie vide ;
 *   2. le limiteur borne le balayage. Un code à six chiffres se force en un
 *      million d'essais : six tentatives par dix minutes et par adresse
 *      rendent l'entreprise absurde, sans gêner la personne qui se trompe ;
 *   3. la comparaison est à durée constante (cf. lib/reglages/maintenance.ts).
 *
 * Le retour est un CODE, jamais une phrase : la copie du site vit dans
 * `content/i18n.ts`, en français et en anglais, et l'écran la résout.
 */
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { ACCES_DUREE_S, CODE_MOTIF, COOKIE_ACCES } from "@/lib/reglages/code";
import { codeValide, etatMaintenance, laissezPasser } from "@/lib/reglages/maintenance";

/* Types seuls : un fichier « use server » n'exporte que des fonctions
   asynchrones, chaque export y étant un point d'entrée réseau. */
export type AccesErreur = "forme" | "refus" | "trop" | "indispo";
export type AccesState = { erreur: AccesErreur | null };

const TENTATIVES = 6;
const FENETRE_MS = 10 * 60 * 1000;

/**
 * Destination du retour, ramenée à un chemin interne.
 *
 * Le champ vient du navigateur : sans ce filtre, il ferait de l'écran de
 * maintenance une redirection ouverte, exploitable en hameçonnage. Seul un
 * chemin absolu du site est accepté ; `//hôte` est un chemin réseau, pas un
 * chemin interne, et l'antislash est écarté parce que certains navigateurs le
 * normalisent en barre oblique.
 */
function destinationSure(valeur: FormDataEntryValue | null): string {
  const brut = typeof valeur === "string" ? valeur : "";
  if (!brut.startsWith("/") || brut.startsWith("//") || brut.includes("\\")) return "/fr";
  return brut;
}

export async function ouvrirAvecCodeAction(_precedent: AccesState, form: FormData): Promise<AccesState> {
  const destination = destinationSure(form.get("destination"));
  // Espaces tolérés à la saisie : un code se dicte souvent « 412 830 ».
  const saisi = String(form.get("code") ?? "").replace(/\s+/g, "");

  if (!CODE_MOTIF.test(saisi)) return { erreur: "forme" };

  const ip = requestIp(await headers());
  if (!rateLimit(`maintenance:${ip}`, TENTATIVES, FENETRE_MS).allowed) return { erreur: "trop" };

  const etat = await etatMaintenance();
  // Rouvert entre l'affichage de l'écran et la saisie : la personne n'a plus
  // besoin de code, on la renvoie simplement là où elle allait.
  if (!etat.ferme) redirect(destination);

  if (!codeValide(saisi, etat.code)) return { erreur: "refus" };

  const jeton = laissezPasser(saisi);
  // Signature impossible : le secret manque à l'hébergement. Le dire, plutôt
  // que poser un cookie qui ne sera jamais reconnu.
  if (!jeton) return { erreur: "indispo" };

  (await cookies()).set({
    name: COOKIE_ACCES,
    value: jeton,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCES_DUREE_S,
  });

  redirect(destination);
}
