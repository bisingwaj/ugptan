/* Chiffre clé saisi en texte — animé quand c'est un nombre, rendu tel quel
   sinon.

   Les valeurs des blocs administrés (« 1 000 », « 6,56 », « 30 M », « 2025 »,
   « 01 », « IDA / AFD ») arrivent de la console sous forme de TEXTE. Seules
   celles qui se lisent sans ambiguïté comme une quantité passent par
   `Compteur` ; tout le reste s'affiche exactement comme il a été saisi :

   · une année (quatre chiffres entre 1900 et 2100) ou un rang (« 01 ») n'est
     pas une quantité, la faire défiler depuis zéro n'aurait pas de sens ;
   · un séparateur ambigu (« 1.000 ») ou un format mixte n'est pas deviné.

   La locale de formatage est déduite de la SAISIE, et non de la langue de la
   page : « 1 000 » garde son espace, « 1,000 » sa virgule, « 6,56 » sa virgule
   décimale. Le chiffre affiché à la fin du décompte reste celui du rédacteur.

   Composant serveur : il ne fait que choisir entre le texte et le compteur
   client, auquel il ne passe que des valeurs sérialisables. */
import { Compteur } from "@/components/motion/Compteur";

type Lecture = {
  valeur: number;
  locale: string;
  options: Intl.NumberFormatOptions;
  suffixe: string;
};

/** Suffixe toléré après le nombre : « % », « + », ou une unité courte
 *  séparée par une espace (« M », « km », « Md$ »). */
const SUFFIXE = /^(?:\s?[%+]|[   ][^\d\s]{1,4})?$/;

function lire(texte: string): Lecture | null {
  const brut = texte.trim();
  const m = /^(\d[\d   .,]*\d|\d)(.*)$/.exec(brut);
  if (!m) return null;
  const [, nombre, suffixe] = m;
  if (!SUFFIXE.test(suffixe)) return null;

  // Entier sans séparateur.
  if (/^\d+$/.test(nombre)) {
    if (nombre.length > 1 && nombre.startsWith("0")) return null; // rang : « 01 »
    const n = Number(nombre);
    if (nombre.length === 4 && n >= 1900 && n <= 2100) return null; // année
    return { valeur: n, locale: "fr-FR", options: { useGrouping: false }, suffixe };
  }

  // Entier groupé par espaces : « 11 500 ».
  if (/^\d{1,3}(?:[   ]\d{3})+$/.test(nombre)) {
    return { valeur: Number(nombre.replace(/\D/g, "")), locale: "fr-FR", options: {}, suffixe };
  }

  // Entier groupé par virgules : « 11,500 ».
  if (/^\d{1,3}(?:,\d{3})+$/.test(nombre)) {
    return { valeur: Number(nombre.replace(/\D/g, "")), locale: "en-GB", options: {}, suffixe };
  }

  // Décimal à virgule : « 6,56 ».
  const virgule = /^(\d+),(\d+)$/.exec(nombre);
  if (virgule) {
    const dec = virgule[2].length;
    return {
      valeur: Number(`${virgule[1]}.${virgule[2]}`),
      locale: "fr-FR",
      options: { useGrouping: false, minimumFractionDigits: dec, maximumFractionDigits: dec },
      suffixe,
    };
  }

  // Décimal à point : « 6.56 » (mais pas « 1.000 », ambigu).
  const point = /^(\d+)\.(\d{1,2}|\d{4,})$/.exec(nombre);
  if (point) {
    const dec = point[2].length;
    return {
      valeur: Number(nombre),
      locale: "en-GB",
      options: { useGrouping: false, minimumFractionDigits: dec, maximumFractionDigits: dec },
      suffixe,
    };
  }

  return null;
}

export function ChiffreCle({ texte }: { texte: string | null | undefined }) {
  if (!texte) return null;
  const lecture = lire(texte);
  if (!lecture) return <>{texte}</>;
  return (
    <Compteur
      valeur={lecture.valeur}
      locale={lecture.locale}
      options={lecture.options}
      suffixe={lecture.suffixe}
    />
  );
}
