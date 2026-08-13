"use client";

import { useState } from "react";

/**
 * Téléchargement d'un export, avec retour d'attente.
 *
 * POURQUOI CE COMPOSANT PLUTÔT QU'UN `<a download>`
 * Un lien de téléchargement ne donne aucun signe de vie : le navigateur part
 * chercher le fichier sans rien changer à la page, et sur un export qui demande
 * une seconde ou deux, on croit que le clic n'a pas pris — donc on reclique, et
 * l'export repart. En passant par `fetch`, on sait exactement quand la requête
 * commence et quand elle finit, donc on peut le montrer.
 *
 * Le nom du fichier est lu dans l'en-tête `Content-Disposition` de la réponse :
 * c'est le serveur qui le compose (cf. api/newsletter/export/route.ts), et il
 * doit le rester — le dupliquer ici les ferait diverger au premier changement.
 */
export function ExportButton({
  href,
  label,
  pendingLabel = "Export en cours…",
  className = "btn btn--outline btn--sm",
}: {
  href: string;
  label: string;
  /** Libellé d'attente. Même convention que le reste de la console : le
   *  libellé bascule, suivi de points de suspension. */
  pendingLabel?: string;
  className?: string;
}) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const telecharger = async () => {
    if (enCours) return;
    setEnCours(true);
    setErreur(null);

    try {
      const reponse = await fetch(href);
      if (!reponse.ok) throw new Error(`réponse ${reponse.status}`);

      const blob = await reponse.blob();
      const url = URL.createObjectURL(blob);

      // Ancre jetable : c'est la seule façon de déclencher un enregistrement
      // en imposant un nom de fichier depuis du script.
      const ancre = document.createElement("a");
      ancre.href = url;
      ancre.download = nomDuFichier(reponse.headers.get("content-disposition"));
      document.body.append(ancre);
      ancre.click();
      ancre.remove();

      // Libère la mémoire retenue par le blob, une fois l'enregistrement lancé.
      URL.revokeObjectURL(url);
    } catch (cause) {
      console.error("[export] téléchargement impossible", cause);
      setErreur("Le téléchargement a échoué. Réessayez dans un instant.");
    } finally {
      setEnCours(false);
    }
  };

  return (
    <span className="adm-export">
      <button type="button" onClick={telecharger} disabled={enCours} className={className}>
        {enCours ? pendingLabel : label}
      </button>
      {erreur && <span className="adm-export__error" role="alert">{erreur}</span>}
    </span>
  );
}

/**
 * Nom porté par `Content-Disposition`, ou un repli neutre.
 *
 * Gère les deux formes de l'en-tête : `filename="…"` et `filename*=UTF-8''…`,
 * cette dernière étant celle qu'utilisent les serveurs dès qu'un accent entre
 * dans le nom.
 */
function nomDuFichier(entete: string | null): string {
  if (!entete) return "export";

  const encode = /filename\*=UTF-8''([^;]+)/i.exec(entete);
  if (encode) {
    try {
      return decodeURIComponent(encode[1].trim());
    } catch {
      // En-tête mal formé : on retombe sur la forme simple ci-dessous.
    }
  }

  const simple = /filename="?([^";]+)"?/i.exec(entete);
  return simple ? simple[1].trim() : "export";
}
