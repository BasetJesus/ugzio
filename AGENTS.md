<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UGZIO v4 Blueprint — Source of Truth

Full specification is in the conversation context. Key principles:

## Architecture
- **Next.js 16 App Router** → Operational system (routes, auth, state machine, webhooks, billing)
- **Python FastAPI** → Intelligence system (OpenAI calls, ZioBrain inference, XGBoost scoring)
- **BullMQ** → Durable event bus (never Redis Pub/Sub for critical events)
- **PostgreSQL** with RLS for multi-tenant isolation

## Order State Machine (canonical string values)
`CREATED → PRE_SHIPPING_CONFIRM_SENT → BUYER_CONFIRMED → SHIPPED → DELIVERED → UGC_REQUESTED → UGC_RECEIVED`
Alternate: `INTELLIGENT_CANCEL`, `PENDING_RESCHEDULE`, `REFUSED`

## Every screen must answer: "What orders will lose me money today?"
- Action-oriented operational UI. No beautiful empty SaaS dashboards.
- Each alert has exactly ONE action button. No information without a next step.
- KPI cards must be screenshot-shareable (organic growth via WhatsApp forwards).

## AI Rules
- Never makes irreversible decisions (no auto-blacklist, no auto-cancel)
- OpenAI called ONLY from Python — never from Next.js
- Every recommendation creates an `AIEvaluation` record

## Subscription
- Free: 3 orders/month | Croissance: 129 TND/month unlimited
- Konnect payment only (no Stripe)

## Design
- `bg-black`, cards `bg-zinc-900/50 border-zinc-800 rounded-xl`
- Primary: `bg-purple-600`, Danger: `text-red-400`, Success: `text-green-400`
- Mobile-first (sellers use phones)
- Dark/white purple theme, Darija + French

## Architecture Stability Rules (HARD RULES)

### Never allow server component crashes
All server functions must return `safeFallback` objects. Never throw in UI path.

### All Prisma calls go through service layer only
No direct `prisma` imports in pages/layouts. Only services.

### Service layer always returns structured data
Every service wraps in try/catch and returns empty defaults on failure.

### One unified visual system
All pages use: `KpiCard` component, CSS variables from `globals.css`, same spacing/animation system.

### No complexity increase
If a feature needs >2 layers → simplify. Never duplicate logic. Never add unnecessary abstractions.

### `transitionStatus()` returns `{ok, status|error}` — never throws
Use `transitionOrderStatus()` which handles errors internally and returns `null` on failure.

### All services return `{success: boolean}` for mutations — never throw
`markConfirmed`, `cancelOrder`, `scheduleRetry`, etc. all return `{success: true}` or `{success: false}`.
