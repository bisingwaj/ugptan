/**
 * Mise en forme des dates d'événement.
 *
 * Séparé de `lib/format.ts`, qui date des ARTICLES : un article porte un
 * instant, un événement porte un INTERVALLE, et rendre un intervalle est un
 * autre métier — il faut décider ce qui se répète (« 12 – 14 septembre 2026 »
 * et non « 12 septembre 2026 – 14 septembre 2026 ») et ce qui se tait (l'heure
 * d'une journée entière).
 *
 * Tout est calculé au fuseau de Kinshasa, pour la même raison qu'ailleurs dans
 * le projet : rendu côté serveur, un horodatage laissé au fuseau de la machine
 * afficherait l'heure de l'hébergeur. `en-GB` et non `en-US` : le site
 * s'adresse d'abord à des partenaires institutionnels, qui lisent
 * « 23 June 2025 ».
 */
import type { Lang } from "@/lib/pick";

const TZ = "Africa/Kinshasa";
const LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-GB" };

/** Fabrique paresseuse : un `Intl.DateTimeFormat` coûte, on ne le crée qu'une fois. */
const memo = new Map<string, Intl.DateTimeFormat>();

function fmt(lang: Lang, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const cle = `${lang}:${JSON.stringify(options)}`;
  let f = memo.get(cle);
  if (!f) {
    f = new Intl.DateTimeFormat(LOCALE[lang], { ...options, timeZone: TZ });
    memo.set(cle, f);
  }
  return f;
}

/**
 * Jour civil à Kinshasa, en « AAAA-MM-JJ ».
 *
 * Le format « sv-SE » est retenu pour une seule raison, la même qu'en
 * `lib/format.ts` : c'est le seul que l'ICU rende déjà dans cet ordre. Il sert
 * autant à comparer deux instants qu'à dater un événement en journée entière.
 */
const jourISO = (date: Date): string =>
  new Intl.DateTimeFormat("sv-SE", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: TZ,
  }).format(date);

/** Deux instants tombent-ils le même jour à Kinshasa ? */
export const memeJour = (a: Date, b: Date): boolean => jourISO(a) === jourISO(b);

const memeAnnee = (a: Date, b: Date): boolean => jourISO(a).slice(0, 4) === jourISO(b).slice(0, 4);

/** Même mois du même millésime — « octobre 2026 » et non « octobre » tout court. */
const memeMois = (a: Date, b: Date): boolean => jourISO(a).slice(0, 7) === jourISO(b).slice(0, 7);

/** « 12 septembre 2026 » / « 12 September 2026 ». */
export const dateLongue = (date: Date, lang: Lang): string =>
  fmt(lang, { day: "numeric", month: "long", year: "numeric" }).format(date);

/** « 12 sept. 2026 » / « 12 Sep 2026 » — la ligne mono des cartes. */
export const dateCourte = (date: Date, lang: Lang): string =>
  fmt(lang, { day: "numeric", month: "short", year: "numeric" }).format(date);

/** « 09:00 ». Toujours sur 24 h : le site est francophone d'abord. */
export const heure = (date: Date, lang: Lang): string =>
  fmt(lang, { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);

/** Année au fuseau de Kinshasa — intertitres des listes par millésime. */
export const anneeEvenement = (date: Date): number => Number(jourISO(date).slice(0, 4));

/**
 * Intervalle de dates, sans les heures.
 *
 * Le principe tient en une phrase : RIEN NE SE RÉPÈTE À GAUCHE de ce que la
 * borne de droite porte déjà. D'où quatre rendus, du plus resserré au plus
 * complet :
 *
 *   · même jour               → « 12 septembre 2026 »
 *   · même mois               → « 20 – 22 octobre 2026 »
 *   · même année, autre mois  → « 30 septembre – 2 octobre 2026 »
 *   · années différentes      → « 28 décembre 2026 – 3 janvier 2027 »
 *
 * Le tiret demi-cadratin entouré d'espaces est la convention typographique d'un
 * intervalle ; un trait d'union collerait les deux dates.
 */
export function intervalleDates(startAt: Date, endAt: Date | null, lang: Lang, court = false): string {
  const longue = court ? dateCourte : dateLongue;
  if (!endAt || memeJour(startAt, endAt)) return longue(startAt, lang);

  // Le mois se répète : seul le quantième ouvre l'intervalle.
  if (memeMois(startAt, endAt)) {
    return `${fmt(lang, { day: "numeric" }).format(startAt)} – ${longue(endAt, lang)}`;
  }

  // L'année seule se répète : elle est portée par la borne de droite.
  if (memeAnnee(startAt, endAt)) {
    const debut = fmt(lang, { day: "numeric", month: court ? "short" : "long" }).format(startAt);
    return `${debut} – ${longue(endAt, lang)}`;
  }

  return `${longue(startAt, lang)} – ${longue(endAt, lang)}`;
}

/**
 * Plage horaire, ou `null` quand il n'y a rien d'utile à dire.
 *
 * Rien à dire dans deux cas : une journée entière (l'heure saisie ne veut rien
 * dire) et un événement à cheval sur plusieurs jours (l'heure de fin appartient
 * à l'autre date, elle est déjà lisible dans l'intervalle).
 */
export function plageHoraire(
  startAt: Date,
  endAt: Date | null,
  allDay: boolean,
  lang: Lang,
): string | null {
  if (allDay) return null;
  const debut = heure(startAt, lang);
  if (!endAt || !memeJour(startAt, endAt)) return debut;
  return `${debut} – ${heure(endAt, lang)}`;
}

/**
 * Date d'un événement pour un moteur de recherche ou un agenda : `YYYY-MM-DD`
 * quand la journée est entière, l'instant ISO complet sinon.
 *
 * Schema.org attend ce format-là pour un événement en journée : un instant
 * précis y ferait croire à une heure de début qui n'a pas été fixée.
 */
export function isoEvenement(date: Date, allDay: boolean): string {
  return allDay ? jourISO(date) : date.toISOString();
}
