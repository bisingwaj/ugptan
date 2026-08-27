/**
 * L'écran servi pendant une fermeture. Atteint UNIQUEMENT par réécriture du
 * proxy : personne n'y arrive en tapant l'adresse, et si quelqu'un le fait
 * alors que le site est ouvert, il est renvoyé à l'accueil plutôt que de lire
 * une fermeture qui n'existe pas.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { dict } from "@/content/i18n";
import { asLang, estLocale } from "@/lib/params";
import { etatMaintenance } from "@/lib/reglages/maintenance";
import { EcranMaintenance } from "@/components/maintenance/EcranMaintenance";

/* L'état se lit à chaque requête : une fermeture levée doit se voir tout de
   suite, et cette page n'a de toute façon aucun sens en cache. */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ lang: string }>; searchParams: Promise<{ depuis?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(estLocale(lang) ? asLang(lang) : "fr");
  return { title: `${t.maintenance.titre} · UGPTN` };
}

/**
 * Chemin de retour, ramené à une adresse interne.
 *
 * Il vient du proxy, mais transite par l'URL réécrite : le filtrer ici coûte
 * une ligne et ferme la porte à une redirection ouverte si la réécriture venait
 * un jour à être forgeable.
 */
function cheminSur(depuis: string | undefined, lang: string): string {
  if (!depuis || !depuis.startsWith("/") || depuis.startsWith("//") || depuis.includes("\\")) {
    return `/${lang}`;
  }
  return depuis;
}

export default async function MaintenancePage({ params, searchParams }: Params) {
  const { lang: brut } = await params;
  const lang = estLocale(brut) ? asLang(brut) : "fr";

  const etat = await etatMaintenance();
  // Site rouvert entre la réécriture et le rendu : on ne montre pas une
  // fermeture levée.
  if (!etat.ferme) redirect(`/${lang}`);

  const { depuis } = await searchParams;

  return <EcranMaintenance lang={lang} etat={etat} chemin={cheminSur(depuis, lang)} />;
}
