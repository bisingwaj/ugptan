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
