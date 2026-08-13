/**
 * Écriture d'un fichier CSV destiné à Excel, Google Sheets et aux outils
 * d'emailing.
 *
 * Deux choix dictent la forme du fichier, tous deux dus au tableur qui l'ouvre
 * et non à la norme :
 *
 *   1. SÉPARATEUR POINT-VIRGULE. Excel choisit son séparateur d'après la
 *      configuration régionale du poste, et attend le point-virgule en
 *      configuration française : un fichier à virgules y arrive sur une seule
 *      colonne. Google Sheets, lui, détecte les deux.
 *   2. MARQUE D'ORDRE DES OCTETS (BOM). Sans elle, Excel lit le fichier dans le
 *      jeu de caractères du système et affiche « Désabonné » en « DÃ©sabonnÃ© ».
 *      Elle est invisible partout ailleurs.
 */

/**
 * Caractères par lesquels un tableur reconnaît une FORMULE. Une valeur qui
 * commence par l'un d'eux est préfixée d'une apostrophe.
 *
 * Sans cette précaution, une adresse forgée pour commencer par « = » serait
 * exécutée à l'ouverture du fichier sur le poste de l'administrateur : c'est
 * l'injection de formule CSV. L'apostrophe force le tableur à traiter la
 * cellule comme du texte, et ne s'affiche pas.
 */
const AMORCES_FORMULE = new Set(["=", "+", "-", "@", "\t", "\r"]);

function cellule(valeur: string): string {
  const sain = AMORCES_FORMULE.has(valeur.charAt(0)) ? `'${valeur}` : valeur;

  // Guillemets doublés et champ encadré dès qu'il porte un séparateur, un
  // guillemet ou un retour à la ligne : c'est la règle de la RFC 4180.
  return /[";\r\n]/.test(sain) ? `"${sain.replace(/"/g, '""')}"` : sain;
}

/** Marque d'ordre des octets UTF-8, en tête de fichier. */
const BOM = "﻿";

/** Assemble un CSV complet. `lignes` n'inclut pas l'en-tête. */
export function toCsv(entetes: readonly string[], lignes: readonly string[][]): string {
  const corps = [entetes, ...lignes].map((ligne) => ligne.map(cellule).join(";"));

  // Fin de ligne CRLF : Excel s'accommode de LF, d'autres outils moins.
  return BOM + corps.join("\r\n") + "\r\n";
}
