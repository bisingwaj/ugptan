/* Number + countdown formatting — mirrors the original Carbon build (narrow no-break thousands). */

const NBSP = " ";

export function formatNumber(
  n: number,
  opts: { dec?: number; prefix?: string; suffix?: string } = {},
): string {
  const { dec = 0, prefix = "", suffix = "" } = opts;
  const s = dec > 0 ? n.toFixed(dec) : Math.round(n).toString();
  const parts = s.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return prefix + parts.join(",") + suffix;
}

/** Format a "1280" style integer string with thin thousands separators. */
export const thousands = (n: number): string =>
  String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);

/** Monogramme : initiales d'un libellé de rôle (ex. « Coordonnateur Adjoint » → « CA »).
 *  Utilisé comme visuel de portrait quand aucune photo n'est fournie. */
export const initials = (s: string): string =>
  s
    .replace(/\(.*?\)/g, " ")
    .split(/[\s—–-]+/)
    .filter((w) => w.length > 1 && /[A-Za-zÀ-ÿ]/.test(w[0]))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/**
 * Date et heure pour les écrans internes de la console.
 *
 * Fuseau figé sur Kinshasa : rendu côté serveur, un horodatage laissé au
 * fuseau de la machine afficherait l'heure de l'hébergeur, pas celle de
 * l'équipe qui lit l'écran.
 */
const dateTimeFr = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Kinshasa",
});

export const formatDateTime = (date: Date | null | undefined): string | null =>
  date ? dateTimeFr.format(date) : null;

/**
 * Date d'un article, dans la langue de lecture.
 *
 * Même fuseau que ci-dessus : un communiqué publié à 23 h à Kinshasa doit
 * porter la date de Kinshasa, pas celle du centre de données qui a rendu la
 * page. `en-GB` et non `en-US` : le site s'adresse d'abord à des partenaires
 * institutionnels, qui lisent « 23 June 2025 » et non « June 23, 2025 ».
 */
const dateArticle: Record<"fr" | "en", Intl.DateTimeFormat> = {
  fr: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Kinshasa" }),
  en: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Kinshasa" }),
};

export const formatArticleDate = (date: Date, lang: "fr" | "en"): string =>
  dateArticle[lang].format(date);

/**
 * Année de publication, au fuseau de Kinshasa.
 *
 * Même exigence que ci-dessus, pour la raison inverse : `getFullYear()` lit le
 * fuseau de la machine. Un communiqué publié le 1er janvier à 00 h 30 à Kinshasa
 * y serait daté de l'année précédente sur un serveur en UTC, et le fil
 * chronologique ouvrirait une section « 2024 » au-dessus d'un article de 2025.
 */
const anneeKinshasa = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Africa/Kinshasa" });

export const anneeArticle = (date: Date): number => Number(anneeKinshasa.format(date));

/**
 * Décalage de Kinshasa (UTC+1), constant : la RDC n'applique pas d'heure d'été.
 * Le figer permet de convertir dans les deux sens sans bibliothèque de fuseaux.
 */
const KINSHASA_OFFSET = "+01:00";

/**
 * Date d'un `<input type="datetime-local">` (« 2025-06-23T14:05 »), exprimée à
 * l'heure de Kinshasa. Le format « sv-SE » est retenu pour une seule raison :
 * c'est le seul que l'ICU rende déjà en « AAAA-MM-JJ HH:MM ».
 */
export function toDateTimeLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
    timeZone: "Africa/Kinshasa",
  }).format(date);
  return parts.replace(" ", "T").slice(0, 16);
}

/** Lecture inverse : la saisie du formulaire est de l'heure de Kinshasa. */
export function fromDateTimeLocal(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return null;
  const date = new Date(`${value.slice(0, 16)}:00${KINSHASA_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Même fuseau, sans l'heure : listes et échéances, où la minute n'apporte rien. */
const dateFr = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "Africa/Kinshasa" });

export const formatDate = (date: Date | null | undefined): string | null =>
  date ? dateFr.format(date) : null;

export type Countdown = {
  expired: boolean;
  urgent: boolean;
  d: number;
  hh: string;
  mm: string;
  ss: string;
};

/** Live countdown to an ISO deadline, only for open notices. Returns null otherwise. */
export function computeCountdown(iso?: string, now: number = Date.now()): Countdown | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const t = target - now;
  if (t <= 0) return { expired: true, urgent: true, d: 0, hh: "00", mm: "00", ss: "00" };
  const d = Math.floor(t / 86400000);
  const h = Math.floor((t % 86400000) / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  const s = Math.floor((t % 60000) / 1000);
  const pad = (x: number) => (x < 10 ? "0" : "") + x;
  return { expired: false, urgent: d < 10, d, hh: pad(h), mm: pad(m), ss: pad(s) };
}
