# UGZIO Architecture Rules

## Core Principle

> Every new feature MUST NOT increase architectural complexity.

## Rule 1: Never Allow Server Component Crashes

All server functions must:
- Return safe fallback objects
- Never return `undefined`
- Never throw inside UI rendering path

```ts
// BAD
throw new Error("Something failed")

// GOOD
return null // or return {}.catch → safeFallback
```

## Rule 2: Prisma Safe Access Layer

ALL Prisma calls must go through service layer only:

- No direct `prisma` calls in UI components
- No direct `prisma` calls in page/layout files
- Only service layer modules may import `@/lib/db`

Services may use `prisma` directly. Pages/layouts must call services.

## Rule 3: Service Layer Stability

All services must:
- Always return structured data (never `null`/`undefined` for collection types)
- Always handle errors internally with try/catch
- Return empty defaults on failure (empty arrays, zero values)

```ts
// BAD
function getData() { /* throws on error */ }

// GOOD
function getData() {
  try { return data }
  catch { return EMPTY_FALLBACK }
}
```

## Rule 4: No Throw in UI Path

Never throw errors that can reach the UI rendering path:

```ts
// BAD
if (!order) throw new Error("not found")

// GOOD
if (!order) return { success: false }
```

## Rule 5: Architecture Simplicity

If a feature requires more than 2 layers → simplify it.

Prefer:
- Direct service → UI flow
- Minimal layering
- Explicit code over abstraction

## Rule 6: One Unified Visual System

Every page must use:
- Same header (LiveSystemHeader)
- Same spacing system (p-4 sm:p-6)
- Same theme behavior (CSS variables, not raw colors)
- Same animation system (animate-view-fade-in/out)
- Same card system (KpiCard, MiniKpiCard)

No page-specific UI styles allowed. All styles come from:
- `app/globals.css` (CSS variables)
- `src/lib/ui/design-tokens.ts`
- `src/components/shared/KpiCard.tsx`

## Rule 7: Demo System Isolation

Demo engine should never block rendering. All demo calls must:
- Return immediately with empty data if engine fails
- Never import heavy modules in server component render path
- Always have a real-service fallback

## Rule 8: No Complexity Increase Rule

From now on, every new feature MUST:

1. Not add new architecture unless absolutely required
2. Not introduce new systems unless it improves the core loop
3. Not duplicate service logic
4. Not create parallel logic systems
5. Not add new dependencies
