/**
 * La pièce jointe PDF d'un article : ce qu'on accepte, et comment on la sert.
 *
 * ⚠️ Module lu par le NAVIGATEUR (bloc de dépôt de la console) comme par la
 * couche de lecture publique. Il ne dépend que de `lib/docs/fichier.ts`, lui
 * aussi sans dépendance serveur : l'ouverture et le téléchargement suivent les
 * mêmes règles que les documents publiés, il n'y a pas de raison d'en écrire
 * une seconde version.
 */
import { apercuPossible, formatLisible, poidsLisible, urlTelechargement } from "@/lib/docs/fichier";

export const MIME_PDF = "application/pdf";

/** Pièce jointe résolue pour l'affichage public. */
export type ActuFichier = {
  /** Ouvre le PDF dans un onglet. */
  url: string;
  /** Force l'enregistrement, sous un nom lisible. */
  urlDl: string;
  nom: string;
  /** « PDF ». */
  format: string;
  /** « 1,2 Mo », vide si le poids n'a pas été relevé. */
  poids: string;
  /** Le navigateur sait-il l'afficher (cf. `apercuPossible`) ? */
  apercu: boolean;
};

export function fichierActu(ligne: {
  fileUrl: string | null;
  fileName: string | null;
  fileMime: string | null;
  fileSize: number;
  fileFormat: string | null;
}): ActuFichier | null {
  if (!ligne.fileUrl) return null;
  const nom = ligne.fileName ?? "communique.pdf";
  return {
    url: ligne.fileUrl,
    urlDl: urlTelechargement(ligne.fileUrl, nom),
    nom,
    format: formatLisible(nom, ligne.fileFormat),
    poids: ligne.fileSize > 0 ? poidsLisible(ligne.fileSize) : "",
    apercu: apercuPossible(ligne.fileMime ?? MIME_PDF, ligne.fileUrl),
  };
}
