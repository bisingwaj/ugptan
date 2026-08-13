"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { dict } from "@/content/i18n";
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
  const t = dict(lang).erreur;

  useEffect(() => {
    console.error(`[site] ${[error.name, error.message].filter(Boolean).join(" · ")}`);
  }, [error]);

  return (
    <section className="section">
      <div className="section__inner max-w-[62ch]">
        <h1 className="h2">{t.titre}</h1>
        <p className="lead mt-5">{t.corps}</p>
        {/* Le condensé relie cet écran à la ligne du journal serveur. */}
        {error.digest && (
          <p className="mt-6 font-mono text-[11px] text-c-50">
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
