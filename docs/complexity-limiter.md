# UGZIO Complexity Limiter

> MAXIMUM 2 ARCHITECTURE LAYERS. PERIOD.

This document protects UGZIO from architecture bloat, feature creep, and overengineering.

---

## The Iron Law

```
UI → Service → Prisma

THAT'S IT.
```

**No additional layers. No exceptions.**

---

## HARD LIMITS

These are NOT negotiable.

### Limit 1: Maximum 2 Architecture Layers

**Allowed:**
```
Page/Component → Service → Prisma
```

**Forbidden:**
```
Page → Controller → Service → Repository → Prisma  // ❌ 4 layers

Page → Orchestrator → Service → Prisma         // ❌ 3 layers

Page → Manager → Worker → Service → Prisma      // ❌ 4 layers

Page → UseCase → Interactor → Entity → Prisma  // ❌ DDD/CQRS cancer
```

### Limit 2: No Parallel State Systems

**ONLY ONE source of truth:**
- PostgreSQL via Prisma

**Forbidden:**
- No Redis as primary state
- No in-memory state (except demo engine)
- No local storage state that duplicates server state
- No parallel calculation engines

**Demo engine is the ONLY exception** — and it's a facade that maps to real services.

### Limit 3: No Duplicated Logic

Every piece of business logic lives in EXACTLY ONE service.

**Checklist:**
- [ ] Risk scoring only in `risk.service.ts` / `revenue-protection.service.ts`
- [ ] Order state machine only in `zioconfirm/state-machine.ts`
- [ ] Order creation only in `order.service.ts`
- [ ] CSV parsing only in `order-import.service.ts`

**If you catch yourself copying logic:**
1. Stop
2. Find where it should live
3. Extract to shared function in the right service
4. Delete the copy

### Limit 4: No Orchestration Layer

You don't need an "orchestrator" or "coordinator" or "manager" service.

**If you think you need one:**
- Ask: Can this live in the existing service?
- Ask: Can this be a simple function in the same file?
- Ask: Am I creating complexity to feel clever?

**Demo orchestrator is the ONLY exception** — and it's a simple router:
```typescript
// demo-orchestrator.service.ts
if (DEMO_MODE) {
  return demoEngine.getData()
} else {
  return realService.getData()
}
```

It doesn't orchestrate anything. It routes.

### Limit 5: No "Enterprise" Patterns

These are FORBIDDEN in UGZIO:

| Pattern | Why Forbidden |
|---------|---------------|
| Repository pattern | Prisma IS your repository |
| Unit of Work | Prisma handles transactions |
| DDD "Entities" | Models are in Prisma schema |
| CQRS | Simple reads/writes don't need this |
| Event Sourcing | BullMQ for critical events is enough |
| ORM abstractions | Use Prisma directly in services |
| Factory pattern | Just call the function |
| Strategy pattern for everything | Simple conditionals are fine |

**Exceptions:**
- State machine for order status (`zioconfirm/state-machine.ts`) — this is business-critical
- Event bus for decoupling (`event-bus.ts`) — this is simple EventEmitter

---

## Complexity Budget Rule

### Every Feature Has a Budget

Before building a feature, calculate:

```
Complexity Cost = (New Files) + (New Services) × 2 + (New Models) × 3

Operational Value = (Revenue Protected) + (Failed Deliveries Prevented) + (Faster Decisions)

If Cost > Value → REJECT THE FEATURE.
```

### Examples

**Low Cost, High Value:**
- CSV import (1 service, 1 component, 1 API route) → High value (connects to real data)
- Delivery provider config (1 service, 1 component) → High value (accurate RTS calculations)

**High Cost, Low Value:**
- Multi-step wizard UI → Cost (complex state management) > Value (sellers can fill simple forms)
- Real-time dashboard with websockets → Cost (infra, state sync) > Value (polling works fine)
- Role-based access control (v1) → Cost (complex permission system) > Value (single-user orgs first)

### When to Say "No"

Say **NO** if:
1. The feature doesn't answer "What orders will lose me money today?"
2. The feature adds more than 2 new files
3. The feature requires a new architecture layer
4. The feature duplicates existing logic
5. The feature is "because competitors have it"
6. The feature is "wouldn't it be cool if..."

---

## Code Smells That Indicate Too Much Complexity

### Smell 1: Indirection Without Purpose

```typescript
// BAD — Why isn't this just a function call?
class OrderManager {
  constructor(private orderService: OrderService) {}
  
  async createOrder(data: CreateData) {
    return this.orderService.create(data)
  }
}

// GOOD — Direct is better
await createOrder(orgId, data)
```

### Smell 2: "Manager" / "Coordinator" / "Orchestrator" in Names

```typescript
// BAD — These words usually indicate unnecessary layers
OrderManager.ts
ConfirmationCoordinator.ts
RiskOrchestrator.ts

// GOOD — Clear, single-purpose
order.service.ts
confirmation.service.ts
risk.service.ts
```

### Smell 3: More Than 3 Levels of Nesting

```typescript
// BAD
page
  → controller
    → manager
      → service
        → repository

// GOOD
page
  → service
    → prisma
```

### Smell 4: Interfaces That Only Have One Implementation

```typescript
// BAD — YAGNI (You Ain't Gonna Need It)
interface IOrderService {
  create(data: OrderData): Promise<Order>
}

class OrderService implements IOrderService {
  // ...
}

// GOOD — Just use the class/functions directly
// Add interface WHEN you actually need multiple implementations
```

### Smell 5: Abstract Base Classes With Only One Child

```typescript
// BAD
abstract class BaseService {
  protected abstract doTheThing(): void
}

class OnlyOneService extends BaseService {
  // ...
}

// GOOD — No inheritance needed
class TheService {
  // ...
}
```

---

## Refactoring When Complexity Creeps In

### Step 1: Identify the Bloat

Look for:
- Files with > 300 lines
- Services with > 10 functions
- Multiple files doing similar things
- Deep call stacks

### Step 2: Simplify

**Option A: Extract to new service (if bounded context is different)**
```typescript
// Before: order.service.ts does risk scoring too

// After:
// order.service.ts — order CRUD only
// risk.service.ts — risk scoring only
```

**Option B: Inline the abstraction**
```typescript
// Before: Manager → Service
const result = await orderManager.create(data)

// After: Direct call
const result = await createOrder(orgId, data)
```

**Option C: Delete the pattern**
```typescript
// Before: Strategy pattern for 2 cases
interface ConfirmationStrategy {
  execute(order: Order): Promise<Result>
}

class PhoneConfirm implements ConfirmationStrategy { ... }
class WhatsAppConfirm implements ConfirmationStrategy { ... }

// After: Simple conditional
if (method === "phone") {
  return attemptPhoneConfirm(order)
} else {
  return attemptWhatsAppConfirm(order)
}
```

### Step 3: Verify Simplicity

After refactoring:
1. [ ] Fewer total files?
2. [ ] Fewer layers?
3. [ ] Code easier to understand?
4. [ ] Still passes all tests?
5. [ ] Still serves the core loop?

---

## The "Two Week" Rule

**If a feature takes more than 2 engineering days to build:**
→ It's too complex.
→ Simplify.
→ Build the simplest possible version.

**What you can build in 2 days:**
- CSV import with validation
- Simple CRUD for providers
- Basic KPI tracking
- Action buttons that call services

**What takes longer than 2 days (questionable):**
- Real-time websocket dashboard
- Complex permission system
- Multi-step wizard UI
- "AI-powered" anything

---

## Approved Exceptions

These patterns are allowed because they PAY FOR THEMSELVES:

### 1. Demo Orchestrator

**Why allowed:**
- Enables demo mode without database
- Simple router, not complex orchestration
- High value (sellers can try before connecting data)

### 2. State Machine

**Why allowed:**
- Order status is critical business logic
- Prevents invalid transitions
- Clear, well-defined rules

### 3. Event Bus

**Why allowed:**
- Simple EventEmitter wrapper
- Decouples services without complexity
- Critical events tracked consistently

### 4. BullMQ Queues

**Why allowed:**
- Durable events for critical operations
- Not for general state management
- High value (webhook processing, scheduled messages)

---

## New Feature Checklist

Before writing ANY code for a new feature:

1. [ ] Does it answer "What orders will lose me money today?"
2. [ ] Can it be built in < 2 engineering days?
3. [ ] Does it fit in UI → Service → Prisma?
4. [ ] No new architecture layers needed?
5. [ ] Doesn't duplicate existing logic?
6. [ ] Complexity Cost < Operational Value?

**If ALL YES → Build it.**
**If ANY NO → Reject it, simplify it, or defer it.**

---

## Remember

> The goal is NOT to build the most architecturally impressive system.
> The goal is to build the MOST EFFECTIVE revenue protection system.

Complexity kills:
- Speed of iteration
- Bug fix time
- Onboarding new developers
- Understanding the system

Simplicity wins:
- Faster to build
- Faster to fix
- Easier to understand
- Less surface area for bugs

**When in doubt: DELETE CODE.**
**When in doubt: SIMPLIFY.**
**When in doubt: ASK — does this serve the core loop?**
