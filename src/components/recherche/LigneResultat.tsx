import Link from "next/link";
import type { Resultat } from "@/lib/recherche/query";

/**
 * Une correspondance, en une ligne cliquable.
 *
 * Pas de vignette, et c'est délibéré. Les six fonds n'ont pas la même
 * iconographie — un document publié n'a souvent aucune couverture, une galerie
 * n'est que cela — et mêler des cartes illustrées à des lignes nues sur le même
 * écran ferait lire le fonds le plus imagé comme le plus pertinent. Une ligne
 * uniforme laisse le classement dire ce qu'il a à dire.
 *
 * L'ordre de lecture est celui d'une réponse : ce que c'est, comment ça
 * s'appelle, de quoi ça parle, quand. La pastille de nature vient donc en
 * premier, et la date en dernier.
 */
export function LigneResultat({ resultat, etiquette }: { resultat: Resultat; etiquette: string }) {
  return (
    <Link href={resultat.chemin} className="rec-item">
      <div className="rec-item__haut">
        <span className="mono rec-item__type">{etiquette}</span>
        {resultat.meta && <span className="mono rec-item__meta">{resultat.meta}</span>}
      </div>

      <span className="rec-item__titre">{resultat.titre}</span>

      {resultat.extrait && <span className="rec-item__extrait">{resultat.extrait}</span>}

      {resultat.dateLabel && resultat.dateISO && (
        <time dateTime={resultat.dateISO} className="mono rec-item__date">
          {resultat.dateLabel}
        </time>
      )}
    </Link>
  );
}
