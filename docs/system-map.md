# UGZIO System Architecture Map

> A VISUAL GUIDE TO HOW EVERYTHING FITS TOGETHER.

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER (PAGES / COMPONENTS)                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Pages      │  │ Components   │  │ API Routes   │  │  (Marketing)     │   │
│  │  (Server)    │  │  (Client)   │  │  (Server)    │  │   Landing Page   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────────────────┘   │
│         │                 │                 │                                    │
└─────────┼─────────────────┼─────────────────┼────────────────────────────────────┘
          │                 │                 │
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER (BUSINESS LOGIC)                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Demo Mode Router (DEMO_MODE=true/false)                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ demo-orchestrator.service.ts                                             │   │
│  │ Routes to:                                                                │   │
│  │   → demo-engine.ts (in-memory mock data)    ← if DEMO_MODE=true         │   │
│  │   → real services                            ← if DEMO_MODE=false        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  Real Services:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  ORDER FLOW:                             RISK FLOW:                     │   │
│  │  • order.service.ts                      • risk.service.ts              │   │
│  │  • order-import.service.ts (CSV)        • revenue-protection.service.ts│   │
│  │                                          • operation-outcome.service.ts  │   │
│  │  CONFIRMATION FLOW:                      DELIVERY FLOW:                 │   │
│  │  • confirmation.service.ts               • delivery-provider.service.ts │   │
│  │  • contact-attempt.service.ts (mock)                                   │   │
│  │                                                                         │   │
│  │  SUPPORTING:                                                            │   │
│  │  • auth.service.ts                      • org.service.ts                 │   │
│  │  • overview.service.ts                  • dashboard.service.ts           │   │
│  │  • protect.service.ts (WhatsApp)        • grow.service.ts (UGC)       │   │
│  │  • conversation.service.ts               • shield.service.ts            │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  Service Rules:                                                                 │
│  ✅ All Prisma access from here                                                │
│  ✅ Try/catch around every operation                                          │
│  ✅ Return empty defaults on failure                                          │
│  ✅ Mutations return { success: boolean }                                      │
│  ❌ Never throw in render path                                                 │
│  ❌ No direct prisma in UI                                                    │
│                                                                                  │
└───────────────────────────┬──────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐               │
│  │    Prisma       │  │   Event Bus     │  │    BullMQ       │               │
│  │  (DB Access)    │  │  (In-Process)   │  │  (Durable Events)│               │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘               │
│           │                    │                    │                         │
└───────────┼────────────────────┼────────────────────┼─────────────────────────┘
            │                    │                    │
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL / PERSISTENCE LAYER                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐               │
│  │   PostgreSQL    │  │     Redis       │  │  External APIs  │               │
│  │  (Primary DB)   │  │  (BullMQ Only)  │  │  (Integrations) │               │
│  │                 │  │                 │  │                 │               │
│  │  Models:        │  │                 │  │  • WhatsApp     │               │
│  │  • Organization │  │                 │  │  • Shopify      │               │
│  │  • Order        │  │                 │  │  • Delivery     │               │
│  │  • BuyerIdentity│  │                 │  │    Providers    │               │
│  │  • DeliveryProvider                    │  │                 │               │
│  │  • OperationOutcome                    │  │                 │               │
│  │  • +18 more models                     │  │                 │               │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### Layer 1: UI Layer (Pages / Components)

**Location:** `app/`, `src/components/`

**What it does:**
- Rendering HTML
- User input handling
- Client-side state (filters, toggles, modals)
- Navigation
- Loading/empty states

**What it MUST NOT do:**
- ❌ Import `prisma` directly
- ❌ Contain business logic
- ❌ Calculate economics
- ❌ Make decisions
- ❌ Mutate data directly

**Entry Points:**
- `/app/(app)/` — Authenticated operational UI
- `/app/(auth)/` — Login/register
- `/app/(marketing)/` — Landing page
- `/app/api/` — API routes (special case, call services)

---

### Layer 2: Service Layer (Business Logic)

**Location:** `src/services/`

**What it does:**
- ALL Prisma access
- Business logic
- Risk calculations
- Revenue protection math
- State transitions
- Event emission
- Integration client usage

**What it MUST do:**
- ✅ Wrap all operations in try/catch
- ✅ Return empty defaults on failure
- ✅ Return `{ success: boolean }` for mutations
- ✅ Never `throw` in the UI path
- ✅ Be the ONLY importers of `@/lib/db`

**Service Inventory:**

| Service | Purpose | Mutations |
|---------|---------|-----------|
| `order.service.ts` | Order CRUD, state transitions | ✅ |
| `order-import.service.ts` | CSV parsing, validation, batch create | ✅ |
| `risk.service.ts` | Risk scoring, signals, blacklist | ✅ |
| `revenue-protection.service.ts` | RTS loss, revenue at risk calculations | ❌ |
| `confirmation.service.ts` | Confirmation queue, operator actions | ✅ |
| `operation-outcome.service.ts` | Action tracking, outcome stats | ✅ |
| `delivery-provider.service.ts` | Provider CRUD, RTS cost config | ✅ |
| `contact-attempt.service.ts` | Mock contact methods | ✅ |
| `overview.service.ts` | Overview page aggregation | ❌ |
| `demo-orchestrator.service.ts` | DEMO_MODE router | ❌ |

---

### Layer 3: Infrastructure Layer

**Location:** `src/lib/`

**What it does:**
- Prisma singleton (`src/lib/db.ts`)
- Event bus (`src/lib/events/event-bus.ts`)
- BullMQ queues (`src/lib/events/queues.ts`)
- Safe render utilities (`src/lib/core/safe-render.ts`)
- State machine (`src/lib/zioconfirm/state-machine.ts`)
- Theme provider (`src/lib/ui/theme-provider.tsx`)
- Auth options (`src/lib/auth/options.ts`)
- Integration clients (`src/lib/whatsapp/client.ts`)

**What it is:**
- Low-level utilities
- Not business logic
- Not called directly from UI

---

### Layer 4: External / Persistence Layer

**What it is:**
- PostgreSQL (primary database)
- Redis (BullMQ only)
- External API integrations

**What it does:**
- Persist all data
- Queue critical events
- Connect to third-party services

**Never access directly from:**
- Pages
- Components
- UI layer in general

---

## Data Flow Example

### Complete Flow: CSV Import → Confirmation → Outcome

```
1. USER ACTION: Upload CSV at /orders/import
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ UI Layer                                                    │
│ OrderImportPanel.tsx → fetch(/api/v1/orders/import)        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ API Route                                                   │
│ /api/v1/orders/import → service call                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Service Layer                                               │
│                                                             │
│ order-import.service.ts:                                   │
│   1. Parse CSV                                              │
│   2. Validate columns/rows                                  │
│   3. For each valid row:                                    │
│      → createOrder() (order.service.ts)                    │
│         → scoreAndPersist() (risk.service.ts)             │
│         → emit("ORDER_CREATED") (event-bus.ts)            │
│                                                             │
│ Each order gets:                                            │
│   • trustScore calculated                                   │
│   • riskLevel determined                                    │
│   • confirmation queue entry created                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Infrastructure Layer                                        │
│ prisma.order.create() → PostgreSQL                          │
│ emit("ORDER_CREATED") → EventBus → BullMQ                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Persistence Layer                                           │
│ PostgreSQL: Order record + BuyerIdentity update             │
└─────────────────────────────────────────────────────────────┘

                            │
                            ▼ (later, operator action)

2. USER ACTION: Operator clicks "Secure Revenue" at /confirm
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ UI Layer                                                    │
│ ConfirmationPanel.tsx → fetch(/api/confirm/${orderId})    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Service Layer                                               │
│                                                             │
│ confirmation.service.ts:                                    │
│   1. markConfirmed()                                        │
│      → calculateActionOutcome() (revenue-protection.ts)   │
│         → revenueSaved = orderAmount × failureProbability  │
│         → lossPrevented = rtsCost × failureProbability    │
│      → recordOutcome() (operation-outcome.service.ts)      │
│         → OperationOutcome record created                   │
│      → emit("ORDER_CONFIRMED")                              │
│      → transitionOrderStatus("BUYER_CONFIRMED")           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Outcome Display                                             │
│                                                             │
│ /overview shows:                                            │
│   • Revenue at risk                                         │
│   • Revenue Protected today (from OperationOutcome)         │
│   • RTS Loss Prevented today (from OperationOutcome)       │
│   • Confirmation rate                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Cross-Cutting Concerns

### DEMO_MODE Isolation

```
┌─────────────────────────────────────────────────────────────┐
│                    demo-orchestrator.service.ts              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  if (DEMO_MODE === true)                                    │
│      └──→ demo-engine.ts (in-memory Map, no database)      │
│                                                             │
│  if (DEMO_MODE === false)                                   │
│      └──→ real services (Prisma + PostgreSQL)              │
│                                                             │
│  DEMO_MODE is controlled by:                                │
│  NEXT_PUBLIC_DEMO_MODE=true/false in .env                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key point:** UI layer never knows if it's demo or real. It just calls the orchestrator.

### Safe Render Pattern

Every service function follows:

```typescript
const EMPTY_FALLBACK = { stats: {...}, items: [] }

export async function getData(orgId: string) {
  try {
    const data = await prisma.something.findMany(...)
    return transform(data)
  } catch {
    return EMPTY_FALLBACK  // ALWAYS safe
  }
}
```

**Never return `undefined` or `null` for collections.**

### Event System

```
┌─────────────────────────────────────────────────────────────┐
│                      Event Bus                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Two systems:                                               │
│                                                             │
│  1. event-bus.ts (In-Process EventEmitter)                 │
│     ├── ORDER_CREATED                                       │
│     ├── ORDER_UPDATED                                       │
│     ├── ORDER_CONFIRMED                                     │
│     ├── ORDER_CANCELLED                                     │
│     ├── RISK_CALCULATED                                     │
│     └── + more                                              │
│                                                             │
│  2. BullMQ (Durable Redis-backed queues)                   │
│     ├── critical-events (ORDER_CREATED, etc.)              │
│     ├── scheduled-messages                                  │
│     ├── webhook-processing                                  │
│     └── whatsapp-outbound                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Forbidden Architecture Patterns

### ❌ 3+ Layers

```
BAD:
Page → Controller → Manager → Service → Repository → Prisma

GOOD:
Page → Service → Prisma
```

### ❌ Direct Prisma in UI

```typescript
// BAD — NEVER do this
import { prisma } from "@/lib/db"

// In a page/component:
const orders = await prisma.order.findMany()  // ❌

// GOOD — Go through services
import { listOrders } from "@/services/demo-orchestrator.service"

const orders = await listOrders(orgId)  // ✅
```

### ❌ Throwing in Service Layer

```typescript
// BAD
export async function getData() {
  const data = await prisma.order.findMany()
  if (!data) throw new Error("Not found")  // ❌
  return data
}

// GOOD
const EMPTY = []

export async function getData() {
  try {
    const data = await prisma.order.findMany()
    return data ?? EMPTY
  } catch {
    return EMPTY  // ✅
  }
}
```

### ❌ Duplicated Logic

```typescript
// BAD — risk calculation in 3 places
// order.service.ts
// confirmation.service.ts
// overview.service.ts

// GOOD — risk calculation in ONE place
// revenue-protection.service.ts
//   → calculateFailureProbability()
//   → calculateEstimatedRtsLoss()
//   → calculateActionOutcome()
```

---

## Quick Reference Card

### When Building Something New

1. **Which layer?**
   - UI rendering → Pages/Components
   - Business logic → Service
   - Low-level utility → lib/

2. **Check the Product Firewall:**
   - Does it reduce failed deliveries?
   - Does it protect revenue?
   - Does it accelerate decisions?

3. **Check the Architecture Law:**
   - Fits in UI → Service → Prisma?
   - No extra layers?

4. **Check the Complexity Budget:**
   - Cost < Value?

### When Fixing Bugs

1. **Find the right layer**
2. **Don't patch in UI what should be fixed in service**
3. **Don't patch in service what should be fixed in data**
4. **Always add try/catch if missing**

---

## Remember

> The architecture is NOT a prison.
> It's a protection.

It protects:
- You from complexity
- The codebase from feature bloat
- Future developers from confusion
- Users from crashes

**Simple systems are fast systems.**
**Fast systems are effective systems.**
**Effective systems are the ones that win.**
