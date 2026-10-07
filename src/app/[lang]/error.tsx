"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLang, type Lang } from "@/lib/pick";

/**
 * Frontière d'erreur du site public.
 *
 * Presque toutes les pages lisent la base. Sans cette frontière, une connexion
 * qui tombe pendant un rendu remontait jusqu'au navigateur, où l'objet levé par
 * le pilote Neon s'affichait tel quel (« Uncaught Error: {clientVersion: … } ») :
 * un visiteur devant des internes de Prisma, sans même un lien pour repartir.
 * Placée dans le segment de langue, elle laisse l'en-tête et le pied de page en
 * place et parle la langue de l'URL.
 */
/**
 * Libellés en ligne, et non `dict()` : un error.tsx est un composant client
 * monté sur TOUTES les pages, et importer le dictionnaire y embarquait ses
 * deux langues entières (≈ 100 Ko) dans le JavaScript de chaque page, pour
 * cinq phrases.
 */
const LIBELLES: Record<Lang, { titre: string; corps: string; reessayer: string; accueil: string; reference: string }> = {
  fr: {
    titre: "Cette page n'a pas pu être affichée",
    corps: "Une donnée nécessaire à cette page n'a pas pu être lue. Rien n'est perdu : seul l'affichage a échoué. Réessayez dans un instant.",
    reessayer: "Réessayer",
    accueil: "Retour à l'accueil",
    reference: "Référence",
  },
  en: {
    titre: "This page could not be displayed",
    corps: "Data required by this page could not be read. Nothing is lost: only the display failed. Please try again in a moment.",
    reessayer: "Try again",
    accueil: "Back to home",
    reference: "Reference",
  },
};

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  // error.tsx ne reçoit pas les paramètres de route : la langue se lit sur l'URL.
  const segment = pathname.split("/")[1] ?? "";
  const lang: Lang = isLang(segment) ? segment : "fr";
  const t = LIBELLES[lang];

  /* Aucune journalisation ici, délibérément. Le message transmis au navigateur
     est la sérialisation d'un objet du pilote base, que la production remplace
     de toute façon par le seul condensé : il n'apprend rien. La cause réelle est
     déjà tracée côté serveur (cf. src/instrumentation.ts), et le condensé affiché
     ci-dessous fait le lien. Un `console.error` de plus ne ferait qu'empiler une
     seconde erreur dans la console, avec une pile pointant vers ce composant
     plutôt que vers la panne. */

  return (
    <section className="section">
      <div className="section__inner max-w-[62ch]">
        <h1 className="h2">{t.titre}</h1>
        <p className="lead mt-5">{t.corps}</p>
        {/* Le condensé relie cet écran à la ligne du journal serveur. */}
        {error.digest && (
          <p className="mt-6 font-mono text-[11px] text-c-60">
            {t.reference} : {error.digest}
          </p>
        )}
        <div className="stack-sm mt-8 flex flex-wrap gap-2.5">
          <button type="button" onClick={reset} className="btn btn--primary">
            {t.reessayer}
            <span className="arrow">→</span>
          </button>
          <Link href={`/${lang}`} className="btn btn--ghost">{t.accueil}</Link>
        </div>
      </div>
    </section>
  );
}
