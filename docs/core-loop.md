# UGZIO Core Operational Loop

> THE CENTRAL TRUTH OF THE PRODUCT.

Every feature, every screen, every API endpoint must connect to this loop.

---

## The Loop

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           THE CORE LOOP                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐    ┌──────────────┐    ┌─────────────────┐             │
│   │  ORDER   │───▶│  RISK LAYER  │───▶│  OPERATOR ACTION  │            │
│   │  ENTERS  │    │  EVALUATED   │    │   (CONFIRM/RETRY/CANCEL)      │
│   └──────────┘    └──────────────┘    └─────────────────┘             │
│                                                       │                  │
│                                                       ▼                  │
│   ┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐      │
│   │ LEARNING     │◀───│  REVENUE        │◀───│  CUSTOMER       │      │
│   │ SIGNAL       │    │  OUTCOME        │    │  OUTCOME        │      │
│   │ (Better Risk)│    │ (Saved/Lost)    │    │ (Confirmed/RTS) │      │
│   └──────────────┘    └─────────────────┘    └─────────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: ORDER ENTERS — Ingestion Layer

### Input Sources

| Source | Status | Integration |
|--------|--------|-------------|
| CSV Upload | ✅ Done | `/orders/import` |
| Manual Form | ✅ Done | `/orders/new` |
| Shopify | Planned | Future webhook |
| API | Planned | `/api/v1/orders` POST |
| Delivery Provider | Future | Poste Tunisienne, Aramex, etc. |

### What Happens at Ingestion

1. **Validation** — Required columns: `customerName`, `phone`, `amount`, `city`, `product`, `deliveryProvider`
2. **Order Created** — Database record with status = `CREATED`
3. **Risk Scoring** — `trustScore` + `riskLevel` calculated
4. **Psychological Sequence Scheduled** — Pre-delivery confirmation messages
5. **Event Emitted** — `ORDER_CREATED` → Event Bus → Demo Engine / Real Services

### Code Path

```
CSV Upload (UI)
    ↓
/api/v1/orders/import (API Route)
    ↓
importOrdersFromCSV() (order-import.service.ts)
    ↓
createOrder() (order.service.ts)
    ↓
scoreAndPersist() (risk.service.ts)
    ↓
emitCritical("ORDER_CREATED") (queues.ts)
emit("ORDER_CREATED") (event-bus.ts)
```

---

## Phase 2: RISK EVALUATED — Risk Layer

### What Gets Calculated

| Metric | Purpose | Source |
|--------|---------|--------|
| `trustScore` (0-100) | Inverse of risk | buyer history + signals |
| `riskLevel` (low/medium/high) | Bucket for prioritization | threshold on trustScore |
| `failureProbability` (%) | Estimated RTS chance | riskLevel × trustScore modifier |
| `estimatedRtsLoss` (TND) | What you lose if RTS | provider.rtsCost × failureProbability |
| `estimatedRevenueAtRisk` (TND) | Revenue at stake | order.amount × failureProbability |

### Risk Signals

These are the signals that contribute to risk scoring:

1. **First-time buyer** → +15 risk weight
2. **High amount** (>150 TND) → +10 risk weight
3. **Prior failures** → +10 per failure
4. **Hesitation patterns** → +15 risk weight
5. **Unusual region** → varies by wilaya

### Code Path

```
createOrder()
    ↓
scoreAndPersist(phone, orgId, buyerName, orderId) (risk.service.ts)
    ↓
computeScore() (zioshield/scoring.ts)
    ↓
Updates order.trustScore + order.riskLevel
    ↓
emit("RISK_CALCULATED") (event-bus.ts)
```

### Risk Thresholds

| Risk Level | trustScore Range | Action Required |
|-------------|-------------------|-----------------|
| **High** | < 40 | Contact IMMEDIATELY before shipping |
| **Medium** | 40-60 | Verify before shipping |
| **Low** | > 60 | Standard confirmation |

---

## Phase 3: OPERATOR ACTION — Decision Layer

### The Confirmation Queue (`/confirm`)

This is the DECISION state of UGZIO.

Orders are prioritized by:
1. `riskLevel` DESC (high first)
2. `trustScore` ASC (lowest trust first)
3. `createdAt` ASC (oldest first)

### Available Actions

Every action has exactly ONE button in the UI:

| Action | Button Label | When to Use | Outcome Tracking |
|--------|--------------|-------------|------------------|
| **Confirm** | "Secure Revenue" | Buyer confirmed, order ships | `revenueSaved` calculated |
| **Re-contact** | "Re-contact" | No answer, try again | Tracked as attempt |
| **Cancel** | "Prevent Loss" | Risk too high, don't ship | `lossPrevented` calculated |
| **Mark Unreachable** | (in Risk Insight) | All methods exhausted | Partial loss prevention |
| **Mark Suspicious** | (in Risk Insight) | Fraud pattern detected | Trust penalty applied |

### Action Economic Calculation

Before each action, the system calculates:

```typescript
// In revenue-protection.service.ts
calculateActionOutcome(
  action: "confirm" | "cancel" | "unreachable" | "suspicious" | "retry",
  orderAmount: number,
  riskLevel: string,
  trustScore: number,
  providerRtsCost: number
) → { revenueSaved: number, lossPrevented: number }
```

**Confirm Action:**
- `revenueSaved = orderAmount × failureProbability`
- `lossPrevented = providerRtsCost × failureProbability`
- Because: Buyer confirmed → order likely succeeds → revenue protected

**Cancel Action:**
- `revenueSaved = 0`
- `lossPrevented = providerRtsCost × failureProbability`
- Because: You didn't ship → you saved the RTS cost, but lost the revenue

### Code Path

```
Operator clicks button (UI: ConfirmationPanel.tsx)
    ↓
fetch(`/api/confirm/${orderId}`, { action })
    ↓
markConfirmed() / cancelOrder() / etc. (confirmation.service.ts)
    ↓
calculateActionOutcome() (revenue-protection.service.ts)
    ↓
recordOutcome() (operation-outcome.service.ts)
    ↓
emit("ORDER_CONFIRMED" / "ORDER_CANCELLED", etc.)
    ↓
Creates OperationOutcome record with:
  • actionTaken
  • estimatedRevenueSaved
  • estimatedLossPrevented
  • riskLevelBefore
  • orderAmount
  • trustScoreBefore
```

---

## Phase 4: CUSTOMER OUTCOME — Delivery Layer

### Order Status Machine (Canonical)

```
CREATED
    ↓
PRE_SHIPPING_CONFIRM_SENT
    ↓
BUYER_CONFIRMED  ←── (This is the success path)
    ↓
SHIPPED
    ↓
DELIVERED
    ↓
UGC_REQUESTED
    ↓
UGC_RECEIVED
```

### Alternate Paths

```
CREATED → INTELLIGENT_CANCEL (Operator cancelled)
CREATED → PENDING_RESCHEDULE (Buyer requested reschedule)
CREATED → REFUSED (Buyer refused delivery)
```

### Delivery Provider Economics

Each provider has configurable:
- `rtsCostPerFailure` — What you lose per RTS (shipping + packaging)
- `avgDeliveryDays` — Average time to deliver
- `contactSuccessRate` — Optional: % of contacts that succeed

These feed directly into the revenue protection calculations.

---

## Phase 5: REVENUE OUTCOME — Results Layer

### What Gets Tracked

For every operator action, an `OperationOutcome` record is created:

| Field | Purpose |
|-------|---------|
| `actionTaken` | confirm / cancel / unreachable / suspicious / retry |
| `estimatedRevenueSaved` | Calculated at action time |
| `estimatedLossPrevented` | Calculated at action time |
| `riskLevelBefore` | Risk level before decision |
| `orderAmount` | Order value |
| `trustScoreBefore` | Trust before decision |

### Dashboard Display (`/overview`)

The LIVE state shows:

1. **Revenue at risk** — Current orders at risk × failure probability
2. **Revenue Protected today** — Sum of `estimatedRevenueSaved` from outcomes
3. **RTS Loss Prevented today** — Sum of `estimatedLossPrevented` from outcomes
4. **Confirmation rate** — confirmations / (confirmations + cancellations)

### Code Path

```
Overview page loads
    ↓
getRevenueProtectionStats(orgId) (demo-orchestrator.service.ts)
    ↓
getRevenueProtectionStats(orgId) (revenue-protection.service.ts)
    ↓
getTodayOutcomeStats(orgId) (operation-outcome.service.ts)
    ↓
Aggregates OperationOutcome records for today
```

---

## Phase 6: LEARNING SIGNAL — Intelligence Layer

### What We Learn

Every outcome creates a training signal:

```
High risk order → Operator confirmed → Buyer actually confirmed
              → Trust score should increase for similar buyers

High risk order → Operator cancelled → Would have been RTS
              → Trust score should decrease for similar buyers
```

### Current State

- **Signal capture**: `OperationOutcome` + `OrderOutcome` models exist
- **ML training**: `RawOrderFeatures` model exists for feature capture
- **Python service**: `services/ziobrain-py/` exists as stub
- **AIEvaluation**: Tracks AI recommendations and whether they were acted on

### Future Path

The loop closes when:
1. Outcomes are labeled (actual delivery success/failure)
2. Features are captured in `RawOrderFeatures`
3. Python service trains models
4. Better risk scores are produced
5. More revenue is protected

---

## How to Add a Feature to the Loop

When building something new, ask:

1. **Where does it plug in?**
   - Phase 1 (Ingestion)? → New input source
   - Phase 2 (Risk)? → Better signal
   - Phase 3 (Action)? → Better decisions
   - Phase 4 (Outcome)? → Better tracking
   - Phase 5 (Learning)? → Better models

2. **Does it strengthen the loop?**
   - It should make the next iteration better
   - It should NOT create a parallel loop
   - It should NOT require operators to learn new workflows

3. **What's the simplest version?**
   - One service file
   - One API route if needed
   - One UI component if needed

---

## The Loop Contract

> Every feature must have:
> 1. A clear entry point into the loop
> 2. A clear exit point from the loop
> 3. A measurable impact on revenue protection

If it doesn't, it doesn't belong.

---

## Remember

> The loop is the product.
> Everything else is implementation detail.

When you're unsure about a design decision:
1. Open this document
2. Find where it fits in the loop
3. If it doesn't fit → stop
4. If it does fit → build the simplest version
