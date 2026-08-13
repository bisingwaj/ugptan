"use client";

/**
 * Boutons de partage d'un article.
 *
 * Aucun script tiers, aucun compteur, aucun pixel : ce sont de simples liens
 * vers les formulaires de partage des plateformes, plus une copie d'adresse via
 * l'API presse-papiers. Un site institutionnel n'a pas à faire charger le code
 * de trois réseaux sociaux à chacun de ses lecteurs.
 *
 * L'URL est construite à l'exécution depuis `window.location` : elle vaut donc
 * pour l'environnement réellement servi (préproduction comprise), sans dépendre
 * d'une variable de configuration.
 */
import { useCallback, useEffect, useState } from "react";
import { dict } from "@/content/i18n";
import type { Lang } from "@/lib/pick";

type Props = { lang: Lang; titre: string };

export function PartageArticle({ lang, titre }: Props) {
  const t = dict(lang).actus;
  const [url, setUrl] = useState("");
  const [copie, setCopie] = useState(false);

  useEffect(() => setUrl(window.location.href), []);

  const copier = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopie(true);
      window.setTimeout(() => setCopie(false), 2400);
    } catch {
      // Presse-papiers refusé (contexte non sécurisé, permission) : on laisse
      // l'adresse de la barre du navigateur faire le travail.
      setCopie(false);
    }
  }, []);

  const encodeUrl = encodeURIComponent(url);
  const encodeTitre = encodeURIComponent(titre);

  const reseaux = [
    { nom: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeUrl}` },
    { nom: "X", href: `https://twitter.com/intent/tweet?url=${encodeUrl}&text=${encodeTitre}` },
    { nom: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeUrl}` },
    { nom: "WhatsApp", href: `https://api.whatsapp.com/send?text=${encodeTitre}%20${encodeUrl}` },
    { nom: "E-mail", href: `mailto:?subject=${encodeTitre}&body=${encodeUrl}` },
  ];

  return (
    <div className="actu-partage">
      <span className="mono actu-partage__label">{t.partager}</span>

      <div className="actu-partage__liens">
        {reseaux.map((reseau) => (
          <a
            key={reseau.nom}
            href={url ? reseau.href : undefined}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="actu-partage__lien"
            aria-disabled={url ? undefined : true}
          >
            {reseau.nom}
          </a>
        ))}

        <button type="button" onClick={copier} className="actu-partage__lien actu-partage__copier">
          {copie ? t.lienCopie : t.copierLien}
        </button>
      </div>
    </div>
  );
}
