# UGZIO Service Architecture Doctrine

> UI → Service → Prisma. ONLY.

This is the only allowed architecture. No additional layers. No orchestration. No managers.

---

## The Law

```
┌─────────────────────────────────────────────────────────┐
│                    UI LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Pages     │  │ Components  │  │  API Routes     │  │
│  │  (Server)   │  │  (Client)   │  │   (Server)      │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
└─────────┼─────────────────┼──────────────────┼───────────┘
          │                 │                  │
          └─────────────────┼──────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  *.service.ts files (ALL Prisma access here)      │  │
│  │                                                    │  │
│  │  • order.service.ts                                │  │
│  │  • risk.service.ts                                 │  │
│  │  • confirmation.service.ts                         │  │
│  │  • revenue-protection.service.ts                   │  │
│  │  • delivery-provider.service.ts                    │  │
│  │  • operation-outcome.service.ts                    │  │
│  │  • order-import.service.ts                         │  │
│  │  • contact-attempt.service.ts                      │  │
│  │  • overview.service.ts                             │  │
│  │  • demo-orchestrator.service.ts (DEMO_MODE gate)  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  Rules for this layer:                                    │
│  • All business logic lives here                          │
│  • All Prisma calls from here                            │
│  • Try/catch around every operation                      │
│  • Return empty defaults on failure                      │
│  • Mutations return { success: boolean }                 │
└───────────────────────────┬───────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    PRISMA LAYER                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  @/lib/db → PrismaClient singleton                 │  │
│  │                                                    │  │
│  │  • Direct import ONLY from *.service.ts files      │  │
│  │  • NEVER imported from pages/components             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Hard Rules — NO EXCEPTIONS

### Rule 1: Pages/Components MUST NOT import Prisma

```typescript
// BAD — NEVER do this
import { prisma } from "@/lib/db"  // ❌ Forbidden in UI layer

export default function BadPage() {
  const orders = await prisma.order.findMany(...)  // ❌
}
```

```typescript
// GOOD — Always go through services
import { getOrdersPageData } from "@/services/demo-orchestrator.service"

export default function GoodPage() {
  const data = await getOrdersPageData(orgId)  // ✅
}
```

### Rule 2: Services MUST own ALL business logic

If it's not UI rendering and not database access, it belongs in a service.

**What belongs in services:**
- Risk scoring calculations
- Revenue protection math
- State machine validation
- CSV parsing and validation
- Outcome tracking
- Provider economics

**What belongs in UI:**
- Rendering components
- User input handling
- Client-side state (filters, toggles)
- Animation

### Rule 3: Services MUST return safe structured data

Every service function must:
1. Wrap in `try/catch`
2. Return empty defaults on failure
3. Never throw in the render path
4. Never return `undefined` for collections

```typescript
// BAD
export async function getBadData() {
  return prisma.order.findMany(...)  // ❌ What if it throws?
}

// GOOD
const EMPTY_FALLBACK = { stats: {...}, orders: [] }

export async function getGoodData(orgId: string) {
  try {
    const data = await prisma.order.findMany(...)
    return transform(data)
  } catch {
    return EMPTY_FALLBACK  // ✅ Safe fallback
  }
}
```

### Rule 4: Mutations MUST return `{ success: boolean }`

Any service that mutates data must return:
```typescript
{ success: true }     // Operation succeeded
{ success: false, error?: "message" }  // Operation failed
```

**Never throw for expected failures.**

```typescript
// BAD
export async function badMutation() {
  if (!valid) throw new Error("Invalid")  // ❌
  return prisma.order.update(...)
}

// GOOD
export async function goodMutation() {
  try {
    if (!valid) return { success: false, error: "Invalid" }  // ✅
    await prisma.order.update(...)
    return { success: true }  // ✅
  } catch {
    return { success: false, error: "Failed" }  // ✅
  }
}
```

### Rule 5: Demo Orchestrator Pattern

Real services have a demo-mode facade in `demo-orchestrator.service.ts`:

```
Page calls demo-orchestrator.service.ts
    ↓
if DEMO_MODE === true
    → demo-engine.ts (in-memory mock data)
else
    → real service (Prisma + PostgreSQL)
```

**All UI calls go through the orchestrator.** This allows:
- Demo mode without database
- Seamless switching between demo/real
- Consistent interface

### Rule 6: Service Naming Convention

Only `*.service.ts` files are services.

```
✅ order.service.ts
✅ revenue-protection.service.ts
❌ OrderManager.ts
❌ order.controller.ts
❌ order.api.ts
```

### Rule 7: Maximum 2 Layers

```
UI → Service → Prisma
```

**NO additional layers allowed:**

- ❌ No "Manager" layer between UI and Service
- ❌ No "Orchestrator" layer beyond demo-orchestrator
- ❌ No "Controller" layer
- ❌ No "Repository" pattern (Prisma is already your repository)
- ❌ No "UseCase" / "Interactor" pattern

If you think you need another layer:
1. Re-read this document
2. Consider if the logic should be in the existing service
3. Consider if you're over-engineering
4. If still unsure → simplify

---

## Approved Service Inventory

These are the ONLY services in UGZIO:

| Service | Purpose | Mutations |
|---------|---------|-----------|
| `order.service.ts` | Order CRUD, state transitions | ✅ |
| `risk.service.ts` | Risk scoring, signals, blacklist | ✅ |
| `confirmation.service.ts` | Confirmation queue, operator actions | ✅ |
| `revenue-protection.service.ts` | RTS loss, revenue at risk calculations | ❌ |
| `delivery-provider.service.ts` | Provider CRUD, RTS cost config | ✅ |
| `operation-outcome.service.ts` | Action tracking, outcome stats | ✅ |
| `order-import.service.ts` | CSV parsing, validation, batch create | ✅ |
| `contact-attempt.service.ts` | Mock contact methods (WhatsApp/SMS) | ✅ |
| `overview.service.ts` | Overview page aggregation | ❌ |
| `demo-orchestrator.service.ts` | DEMO_MODE router | ❌ |

### Supporting Services (Utilities, not business logic)

| Service | Purpose |
|---------|---------|
| `auth.service.ts` | Session validation |
| `org.service.ts` | Organization management |
| `dashboard.service.ts` | Dashboard aggregation |
| `operations.service.ts` | Operations page aggregation |
| `system-state.service.ts` | System state computation |
| `protect.service.ts` | WhatsApp verification |
| `grow.service.ts` | UGC handling |
| `conversation.service.ts` | Inbox conversations |
| `shield.service.ts` | Shield page data |
| `success.service.ts` | Success stats |

---

## How to Add a New Service

Before creating a new `*.service.ts`:

### Step 1: Justify the Need

Ask:
1. Does this belong in an existing service?
2. Is this a separate bounded context?
3. Would this create duplication?
4. Does this serve the core loop?

### Step 2: Follow the Pattern

Your service must have:

1. **Try/catch around ALL Prisma calls**
2. **Empty fallbacks for all reads**
3. **`{ success: boolean }` for all mutations**
4. **No direct imports from pages/components**
5. **Export from `src/services/index.ts`**

### Step 3: Register with Orchestrator (if needed)

If your service needs DEMO_MODE support:
1. Add wrapper functions in `demo-orchestrator.service.ts`
2. Provide demo-mode fallback behavior
3. Export from `src/services/index.ts`

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Fat API Routes

```typescript
// BAD — Business logic in API route
export async function POST(request: NextRequest) {
  // 50 lines of business logic here...
  const order = await prisma.order.create(...)
  // More logic...
  return NextResponse.json(order)
}
```

```typescript
// GOOD — Delegate to service
export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await createOrder(orgId, body)  // Service call
  return NextResponse.json(result)
}
```

### Anti-Pattern 2: Services Calling UI Components

Services should never:
- Import React components
- Use Next.js navigation
- Handle client-side state
- Access browser APIs

Services are pure (mostly) functions that take input and return data.

### Anti-Pattern 3: Circular Dependencies

```typescript
// BAD
// order.service.ts → imports from risk.service.ts
// risk.service.ts → imports from order.service.ts
```

**Fix:** Identify which is the dependency and which is the dependent. Risk depends on Orders, not vice versa.

### Anti-Pattern 4: God Services

```typescript
// BAD — One service does everything
src/services/everything.service.ts  // ❌
  → 1000+ lines
  → Handles orders, risk, confirmation, analytics, billing...
```

**Fix:** Split by bounded context:
- Order management
- Risk scoring
- Confirmation workflow
- Revenue protection
- etc.

---

## Service Contract Checklist

When creating or modifying a service:

- [ ] All Prisma calls wrapped in try/catch
- [ ] Empty defaults returned on failure
- [ ] No `undefined` for arrays/objects
- [ ] Mutations return `{ success: boolean }`
- [ ] No direct prisma imports from UI layer
- [ ] Functions are exported from `src/services/index.ts`
- [ ] DEMO_MODE support if needed (via orchestrator)
- [ ] No circular dependencies
- [ ] Business logic, not UI logic

---

## Remember

> Services are the backbone of UGZIO.
> They own the business logic.
> They own the data access.
> They protect the UI from complexity.

If a service is hard to test, too big, or does too many things → simplify.

**Simplicity is the feature.**
