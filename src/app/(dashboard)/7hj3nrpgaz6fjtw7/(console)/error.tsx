"use client";

import { ADMIN } from "@/content/admin";

/**
 * Frontière d'erreur de la console.
 *
 * La console lit la base à presque chaque page. Sans cette frontière, une
 * requête qui échoue remontait jusqu'au navigateur, où l'objet levé par le
 * pilote Neon s'affichait tel quel (« Uncaught Error: {clientVersion: "7.9.1"} ») :
 * des internes de Prisma exposés à l'écran, et aucune indication exploitable
 * pour la personne qui administre. Le gabarit reste rendu au-dessus, donc la
 * barre latérale et l'en-tête survivent à l'incident.
 */
export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  /* Aucune journalisation ici : même parti que la frontière publique. La cause
     est tracée côté serveur (cf. src/instrumentation.ts) et le condensé affiché
     plus bas fait le lien ; rejournaliser côté navigateur n'ajouterait qu'une
     seconde erreur, dont la pile désignerait ce composant et non la panne. */

  return (
    <div className="max-w-[68ch]">
      <h1 className="adm__title">{ADMIN.errors.title}</h1>
      <p className="adm__lead">{ADMIN.errors.lead}</p>
      <p className="mt-3 max-w-[62ch] text-[13.5px] leading-[1.6] text-c-60">{ADMIN.errors.hint}</p>
      {/* Le condensé est la seule clé qui relie cet écran à la ligne du journal
          serveur : sans lui, impossible de rapprocher un signalement d'un log. */}
      {error.digest && (
        <p className="mt-4 font-mono text-[11px] text-c-50">
          {ADMIN.errors.reference} : {error.digest}
        </p>
      )}
      <button type="button" onClick={reset} className="btn btn--primary mt-6">
        {ADMIN.errors.retry}
      </button>
    </div>
  );
}
