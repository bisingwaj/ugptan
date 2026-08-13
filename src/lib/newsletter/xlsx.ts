/**
 * Écriture d'un classeur Excel (.xlsx) minimal, sans dépendance.
 *
 * POURQUOI PAS UNE BIBLIOTHÈQUE
 * L'export ne produit qu'une feuille de texte : ni formule, ni format, ni
 * graphique. Les bibliothèques du marché (ExcelJS, SheetJS) pèsent plusieurs
 * mégaoctets et embarquent un moteur complet de lecture-écriture pour ce seul
 * besoin. Un .xlsx étant une archive ZIP de quelques fichiers XML, l'écrire
 * directement tient en un fichier lisible et n'ajoute rien à installer.
 *
 * CE QUE PRODUIT CE MODULE
 * Une archive ZIP **sans compression** (méthode « stocké ») : la compression
 * demanderait un implémenteur de DEFLATE, alors que le format l'autorise à ne
 * pas être utilisée. Le fichier est plus gros qu'un .xlsx habituel, et s'ouvre
 * de la même façon dans Excel, LibreOffice et Google Sheets.
 *
 * Les valeurs sont écrites en CHAÎNES EN LIGNE (`t="inlineStr"`) plutôt que par
 * table de chaînes partagées : le fichier reste lisible ligne à ligne, et les
 * adresses ne se répètent pas d'une cellule à l'autre — la table partagée n'y
 * gagnerait rien.
 */

const encoder = new TextEncoder();

/* --- CRC-32 --------------------------------------------------------------- */

/**
 * Table du CRC-32 (polynôme 0xEDB88320), calculée une fois. Chaque entrée d'une
 * archive ZIP porte l'empreinte de son contenu ; un lecteur qui ne la retrouve
 * pas déclare l'archive corrompue.
 */
const TABLE_CRC = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let valeur = i;
    for (let bit = 0; bit < 8; bit += 1) {
      valeur = valeur & 1 ? (valeur >>> 1) ^ 0xedb88320 : valeur >>> 1;
    }
    table[i] = valeur >>> 0;
  }
  return table;
})();

function crc32(octets: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < octets.length; i += 1) {
    crc = TABLE_CRC[(crc ^ octets[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/* --- Archive ZIP ---------------------------------------------------------- */

type Entree = { nom: string; donnees: Uint8Array };

/**
 * Horodatage figé au 1er janvier 1980, plancher du format ZIP.
 *
 * Une date réelle rendrait deux exports du même contenu différents octet pour
 * octet, sans rien apprendre à personne : le fichier porte déjà sa date dans
 * son nom et dans le système de fichiers.
 */
const HEURE_DOS = 0;
const DATE_DOS = 33; // (1980-1980) << 9 | 1 << 5 | 1

/** Écriture petit-boutiste, seul ordre d'octets admis par le format ZIP. */
function ecrire(vue: DataView, position: number, valeur: number, octets: 2 | 4): void {
  if (octets === 2) vue.setUint16(position, valeur, true);
  else vue.setUint32(position, valeur, true);
}

function zip(entrees: Entree[]): Uint8Array<ArrayBuffer> {
  const noms = entrees.map((entree) => encoder.encode(entree.nom));
  const crcs = entrees.map((entree) => crc32(entree.donnees));

  const tailleLocale = entrees.reduce(
    (total, entree, i) => total + 30 + noms[i].length + entree.donnees.length,
    0,
  );
  const tailleCentrale = entrees.reduce((total, _entree, i) => total + 46 + noms[i].length, 0);

  const sortie = new Uint8Array(tailleLocale + tailleCentrale + 22);
  const vue = new DataView(sortie.buffer);

  const offsets: number[] = [];
  let position = 0;

  // 1. En-têtes locaux, chacun suivi de ses données.
  entrees.forEach((entree, i) => {
    offsets.push(position);

    ecrire(vue, position, 0x04034b50, 4); // signature
    ecrire(vue, position + 4, 20, 2); // version minimale du lecteur
    ecrire(vue, position + 6, 0x0800, 2); // drapeaux : nom de fichier en UTF-8
    ecrire(vue, position + 8, 0, 2); // méthode : stocké
    ecrire(vue, position + 10, HEURE_DOS, 2);
    ecrire(vue, position + 12, DATE_DOS, 2);
    ecrire(vue, position + 14, crcs[i], 4);
    ecrire(vue, position + 18, entree.donnees.length, 4); // taille compressée
    ecrire(vue, position + 22, entree.donnees.length, 4); // taille réelle
    ecrire(vue, position + 26, noms[i].length, 2);
    ecrire(vue, position + 28, 0, 2); // pas de champ supplémentaire
    position += 30;

    sortie.set(noms[i], position);
    position += noms[i].length;

    sortie.set(entree.donnees, position);
    position += entree.donnees.length;
  });

  // 2. Répertoire central : c'est lui que le lecteur ouvre en premier.
  const debutCentral = position;

  entrees.forEach((entree, i) => {
    ecrire(vue, position, 0x02014b50, 4);
    ecrire(vue, position + 4, 20, 2); // version d'écriture
    ecrire(vue, position + 6, 20, 2); // version minimale du lecteur
    ecrire(vue, position + 8, 0x0800, 2);
    ecrire(vue, position + 10, 0, 2);
    ecrire(vue, position + 12, HEURE_DOS, 2);
    ecrire(vue, position + 14, DATE_DOS, 2);
    ecrire(vue, position + 16, crcs[i], 4);
    ecrire(vue, position + 20, entree.donnees.length, 4);
    ecrire(vue, position + 24, entree.donnees.length, 4);
    ecrire(vue, position + 28, noms[i].length, 2);
    ecrire(vue, position + 30, 0, 2); // champ supplémentaire
    ecrire(vue, position + 32, 0, 2); // commentaire
    ecrire(vue, position + 34, 0, 2); // disque d'origine
    ecrire(vue, position + 36, 0, 2); // attributs internes
    ecrire(vue, position + 38, 0, 4); // attributs externes
    ecrire(vue, position + 42, offsets[i], 4); // position de l'en-tête local
    position += 46;

    sortie.set(noms[i], position);
    position += noms[i].length;
  });

  // 3. Fin du répertoire central.
  ecrire(vue, position, 0x06054b50, 4);
  ecrire(vue, position + 4, 0, 2); // numéro de ce disque
  ecrire(vue, position + 6, 0, 2); // disque portant le répertoire
  ecrire(vue, position + 8, entrees.length, 2);
  ecrire(vue, position + 10, entrees.length, 2);
  ecrire(vue, position + 12, position - debutCentral, 4);
  ecrire(vue, position + 16, debutCentral, 4);
  ecrire(vue, position + 20, 0, 2); // commentaire d'archive

  return sortie;
}

/* --- Feuille de calcul ---------------------------------------------------- */

/**
 * Caractères de contrôle interdits par XML 1.0 (tabulation, saut de ligne et
 * retour chariot exceptés). Construit par `RegExp` plutôt qu'écrit en littéral :
 * un littéral porterait ces octets tels quels dans le fichier source, où ils
 * seraient invisibles à la relecture. Excel refuse d'ouvrir un classeur qui en
 * contient, plutôt que de les ignorer.
 */
const CONTROLES_XML = new RegExp("[\u0000-\u0008\u000B\u000C\u000E-\u001F]", "g");

/**
 * Échappement XML. Appliqué à toute valeur venant de la base : une adresse
 * contenant « & » suffirait à rendre le classeur illisible.
 */
const escXml = (valeur: string): string =>
  valeur
    .replace(CONTROLES_XML, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Référence de colonne d'un tableur : 0 → A, 25 → Z, 26 → AA. */
function colonne(index: number): string {
  let reste = index;
  let nom = "";
  do {
    nom = String.fromCharCode(65 + (reste % 26)) + nom;
    reste = Math.floor(reste / 26) - 1;
  } while (reste >= 0);
  return nom;
}

const ligneXml = (valeurs: readonly string[], numero: number): string =>
  `<row r="${numero}">${valeurs
    .map(
      (valeur, i) =>
        `<c r="${colonne(i)}${numero}" t="inlineStr"><is><t xml:space="preserve">${escXml(valeur)}</t></is></c>`,
    )
    .join("")}</row>`;

const DECLARATION = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

/**
 * Classeur d'une feuille, prêt à être renvoyé en pièce jointe.
 *
 * @param nomFeuille onglet du classeur — 31 caractères au maximum, contrainte
 *                   d'Excel, et sans les caractères qu'il réserve.
 */
export function toXlsx(
  entetes: readonly string[],
  lignes: readonly string[][],
  nomFeuille = "Abonnés",
): Uint8Array<ArrayBuffer> {
  const feuille = [entetes, ...lignes]
    .map((valeurs, index) => ligneXml(valeurs, index + 1))
    .join("");

  const onglet = escXml(nomFeuille.replace(/[\\/*?:[\]]/g, " ").slice(0, 31));

  const fichiers: Entree[] = [
    {
      nom: "[Content_Types].xml",
      donnees: encoder.encode(
        `${DECLARATION}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
          `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
          `<Default Extension="xml" ContentType="application/xml"/>` +
          `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
          `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
          `</Types>`,
      ),
    },
    {
      nom: "_rels/.rels",
      donnees: encoder.encode(
        `${DECLARATION}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
          `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
          `</Relationships>`,
      ),
    },
    {
      nom: "xl/workbook.xml",
      donnees: encoder.encode(
        `${DECLARATION}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
          `<sheets><sheet name="${onglet}" sheetId="1" r:id="rId1"/></sheets>` +
          `</workbook>`,
      ),
    },
    {
      nom: "xl/_rels/workbook.xml.rels",
      donnees: encoder.encode(
        `${DECLARATION}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
          `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
          `</Relationships>`,
      ),
    },
    {
      nom: "xl/worksheets/sheet1.xml",
      donnees: encoder.encode(
        `${DECLARATION}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
          `<sheetData>${feuille}</sheetData></worksheet>`,
      ),
    },
  ];

  return zip(fichiers);
}
