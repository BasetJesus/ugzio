export function safeFallback<T>(fallback: T): T {
  return fallback
}

export function safeAsync<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback)
}

export function safeSync<T>(fn: () => T, fallback: T): T {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export function safeString(val: unknown, fallback = ""): string {
  if (typeof val === "string" && val.length > 0) return val
  return fallback
}

export function safeNumber(val: unknown, fallback = 0): number {
  if (typeof val === "number" && !Number.isNaN(val)) return val
  if (typeof val === "string") {
    const n = Number(val)
    if (!Number.isNaN(n)) return n
  }
  return fallback
}
