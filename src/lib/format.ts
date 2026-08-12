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
