export function todayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Time / Display ──────────────────────────────────────────────────────────

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

/** Operational variants for feed context */
export function timeAgoShort(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

/** Human-readable for seller-facing UI */
export function timeAgoVerbose(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? "" : "s"} ago`
}

// ─── Rhythm / Animation ──────────────────────────────────────────────────────

/** Organic staggering delay that increases with index and resets in waves */
export function feedRhythmDelay(index: number, base = 3500, variance = 1500, waveSize = 4): number {
  return base + (index % waveSize) * variance + Math.random() * 800
}

/** Tight rhythm for smaller cards */
export function compactRhythmDelay(index: number, base = 2800, variance = 1200, waveSize = 3): number {
  return base + (index % waveSize) * variance + Math.random() * 400
}

// ─── Number / Format ─────────────────────────────────────────────────────────

export function tnd(amount: number): string {
  return `${amount.toFixed(0)} TND`
}

export function pct(val: number): string {
  return `${val}%`
}
