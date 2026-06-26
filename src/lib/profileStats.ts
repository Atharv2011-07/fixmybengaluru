const WSP_KEY = "bbmp_wsp_complaints";

export function getWspComplaintCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(WSP_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function incrementWspComplaintCount(): number {
  if (typeof window === "undefined") return 0;
  const next = getWspComplaintCount() + 1;
  window.localStorage.setItem(WSP_KEY, String(next));
  return next;
}

/**
 * Compute the current daily streak from a list of quiz dates (YYYY-MM-DD).
 * A streak counts consecutive days ending today or yesterday.
 */
export function computeStreak(dates: string[], today: string): number {
  const set = new Set(dates);
  if (set.size === 0) return 0;

  const toDate = (s: string) => new Date(s + "T00:00:00");
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  let cursor = toDate(today);
  // Allow streak to be "alive" if they played yesterday but not yet today.
  if (!set.has(fmt(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(fmt(cursor))) return 0;
  }

  let streak = 0;
  while (set.has(fmt(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}