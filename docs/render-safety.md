# UGZIO Render Safety Rules

> NEVER THROW IN THE UI RENDER PATH.

Server components must never crash. Always return safe fallbacks.

---

## The Core Principle

```
User comes to UGZIO → Page must render → Even if services fail
```

**Worst case:** User sees empty cards with zero values.

**Never:** User sees Next.js error stack trace.

---

## Safe Render Utilities

All utilities in `src/lib/core/safe-render.ts`:

### `safeFallback<T>(fallback: T): T`

Returns the fallback as-is. Exists for documentation purposes.

```typescript
const EMPTY_STATS = { total: 0, value: 0 }
return safeFallback(EMPTY_STATS)
```

### `safeAsync<T>(fn: () => Promise<T>, fallback: T): Promise<T>`

Wraps an async function. Returns fallback on error.

```typescript
// BAD
const data = await riskyFunction()  // ❌ What if it throws?

// GOOD
const data = await safeAsync(
  () => riskyFunction(),
  EMPTY_FALLBACK  // ✅ Always returns something
)
```

### `safeSync<T>(fn: () => T, fallback: T): T`

Wraps a sync function. Returns fallback on error.

```typescript
// BAD
const result = JSON.parse(suspiciousString)  // ❌

// GOOD
const result = safeSync(
  () => JSON.parse(suspiciousString),
  {}  // ✅
)
```

### `safeString(val: unknown, fallback = ""): string`

Type-safe string extraction.

```typescript
const name = safeString(userInput.name, "Unknown")  // ✅ Never undefined
```

### `safeNumber(val: unknown, fallback = 0): number`

Type-safe number extraction.

```typescript
const amount = safeNumber(req.query.amount, 0)  // ✅ Never NaN
```

---

## Page Level Pattern

Every server page must follow this pattern:

```typescript
export const dynamic = "force-dynamic"

// Define your EMPTY_FALLBACK at the top
const EMPTY_DATA: PageData = {
  stats: { total: 0, value: 0 },
  items: [],
}

export default async function MyPage() {
  // Session check first (redirects, not throws)
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const orgId = await getOrgFromUserId(session.user.id)
  if (!orgId) redirect("/onboarding")

  // Safe data fetching
  let data = EMPTY_DATA
  try {
    data = await getPageData(orgId)
  } catch (e) {
    console.error("[mypage] service error", e)
    // data remains EMPTY_DATA
  }

  // Render with data (guaranteed to be valid)
  return (
    <div>
      <KpiCard value={data.stats.value} ... />
      {data.items.map(...) /* items is always array */}
    </div>
  )
}
```

---

## What is Forbidden

### ❌ Never throw in server component render path

```typescript
// BAD
if (!order) {
  throw new Error("Order not found")  // ❌ Crashes page
}

// GOOD
if (!order) {
  notFound()  // ✅ Next.js built-in — handled gracefully
  // OR
  return <EmptyState message="Order not found" />  // ✅ Custom UI
}
```

### ❌ Never return `undefined` or `null` for collections

```typescript
// BAD
export async function getOrders() {
  try {
    return prisma.order.findMany(...)
  } catch {
    return null  // ❌ UI will crash on .map()
  }
}

// GOOD
export async function getOrders() {
  try {
    return prisma.order.findMany(...)
  } catch {
    return []  // ✅ Safe — .map() works on empty array
  }
}
```

### ❌ Never access potentially-undefined properties without guard

```typescript
// BAD
const value = order.amount.toFixed(2)  // ❌ What if order is null?

// GOOD
const value = order?.amount?.toFixed(2) ?? "0"  // ✅ Safe
```

---

## Approved Fallback Structures

Define these constants at the top of service files.

### Arrays

```typescript
const EMPTY_ARRAY: OrderSummary[] = []
```

### Objects

```typescript
interface OverviewStats {
  total: number
  atRisk: number
  value: number
}

const EMPTY_STATS: OverviewStats = {
  total: 0,
  atRisk: 0,
  value: 0,
}
```

### Complex Page Data

```typescript
interface OrdersPageData {
  stats: { total: number; atRisk: number; ... }
  orders: OrderTableItem[]
}

const EMPTY_ORDERS_PAGE_DATA: OrdersPageData = {
  stats: { total: 0, atRisk: 0, pendingToday: 0, revenueTotal: 0, deliveredRate: 0 },
  orders: [],
}
```

### Demo Orchestrator Fallbacks

In `demo-orchestrator.service.ts`:

```typescript
export const EMPTY_OVERVIEW_DATA: OverviewData = {
  stats: { ... },
  liveOrders: [],
  riskAlerts: [],
  ugcOpportunities: [],
}

export const EMPTY_CONFIRMATION_QUEUE: ConfirmationQueue = {
  items: [],
  total: 0,
  pendingCount: 0,
  contactedCount: 0,
}
```

---

## Service Level Pattern

Every service must follow this pattern:

```typescript
export async function getSomething(orgId: string): Promise<Something> {
  try {
    // Actual logic
    const data = await prisma.something.findMany({
      where: { organizationId: orgId },
    })

    return transform(data)
  } catch {
    // Return safe fallback
    return EMPTY_SOMETHING
  }
}
```

**For mutations:**

```typescript
export async function updateSomething(
  orgId: string,
  id: string,
  data: UpdateData
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.something.findFirst({
      where: { id, organizationId: orgId },
    })

    if (!existing) {
      return { success: false, error: "Not found" }
    }

    await prisma.something.update({
      where: { id },
      data,
    })

    return { success: true }
  } catch {
    return { success: false, error: "Failed" }
  }
}
```

---

## Empty State UI Pattern

When data is empty, show `EmptyState` component:

```tsx
import EmptyState from "@/components/shared/EmptyState"

if (orders.length === 0) {
  return (
    <EmptyState
      icon="📦"
      title="No orders yet"
      description="Import orders or create your first one"
      action={{ label: "Import Orders", href: "/orders/import" }}
    />
  )
}
```

**Never leave blank white space.** Always show something informative.

---

## Loading Pattern

For client components waiting on data:

```tsx
import LoadingSkeleton from "@/components/shared/LoadingSkeleton"

if (loading) {
  return <LoadingSkeleton variant="card" count={3} />
}
```

For server components, use `loading.tsx` file (Next.js Suspense boundary).

---

## Error Recovery Pattern

When things fail:

1. **Log internally** — `console.error("[context] message", error)`
2. **Return fallback** — Never let error propagate to UI
3. **No user-facing error messages** — Users don't care about "database connection failed"
4. **Show empty state** — Users see "No data" which is better than crash

```typescript
// GOOD
let data = EMPTY_DATA
try {
  data = await riskyServiceCall()
} catch (e) {
  console.error("[mypage] failed to load data", e)  // Internal log
  // data stays EMPTY_DATA
}

// Render with data — UI always works
return <PageContent data={data} />
```

---

## API Route Pattern

API routes can throw, but should return structured errors:

```typescript
export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireSession()
    const body = await request.json()

    const result = await doTheThing(orgId, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message === "Unauthorized" ? 401 : 400 }
      )
    }

    console.error("[api/my-route] error:", e)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

---

## Client Component Pattern

Client components should handle their own errors:

```tsx
"use client"

import { useState } from "react"

export default function MyClientComponent() {
  const [data, setData] = useState<Data>(EMPTY_DATA)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/my-data")
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setData(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
      setData(EMPTY_DATA)  // Safe fallback
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        Something went wrong. Please try again.
      </div>
    )
  }

  // ... render
}
```

---

## Forbidden: Next.js `error.tsx` as Safety Net

**DO NOT rely on `error.tsx` as your primary error handling.**

`error.tsx` is:
- A last resort
- For unexpected errors
- Not a replacement for proper try/catch

**Your code should:**
1. Catch expected errors
2. Return safe fallbacks
3. Never let Next.js error boundary be the first line of defense

---

## Checklist

Before considering a page/service "done":

### Pages
- [ ] `export const dynamic = "force-dynamic"`
- [ ] Defines `EMPTY_FALLBACK` constant
- [ ] Uses `try/catch` around service calls
- [ ] Falls back to `EMPTY_DATA` on error
- [ ] Shows `EmptyState` when data is empty
- [ ] Never throws in render path

### Services
- [ ] Every function wraps in `try/catch`
- [ ] Returns empty defaults on failure
- [ ] Never returns `undefined` for arrays
- [ ] Mutations return `{ success: boolean }`
- [ ] Uses `safeNumber`/`safeString` for user input
- [ ] Logs errors with `console.error("[context] ...", e)`

### API Routes
- [ ] Catches all exceptions
- [ ] Returns structured `{ error: "message" }`
- [ ] Never throws to client
- [ ] Auth errors return 401/403
- [ ] Validation errors return 400
- [ ] Internal errors return 500 with generic message

---

## Remember

> The user should never see:
> - "Application error"
> - Runtime stack traces
> - White screens of death
> - `Cannot read property 'map' of undefined`

The user should always see:
- "No orders yet"
- "0 TND at risk"
- Empty KPI cards
- Loading skeletons

**Safety is not optional. It's the default.**
