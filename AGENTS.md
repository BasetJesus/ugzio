<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UGZIO v4 Blueprint — Source of Truth

## Branded System Language
| System | Purpose |
|---|---|
| **ZioShield** | Risk engine |
| **ZioBrain** | Intelligence |
| **ZioConfirm** | Buyer confirmation |
| **ZioFlow** | Workflows |
| **ZioInbox** | Messaging |
| **ZioView** | Operational visibility |
| **ZioLearn** | Outcome learning |
| **ZioIdentity** | Behavioral memory |

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
- Free: 3 orders/month | Essentiel: 49 TND/month (500 orders) | Croissance: 139 TND/month unlimited
- Konnect payment only (no Stripe)

## Design
- Warm off-white base (`--bg-base: #f5f5f0`), white cards with subtle borders
- Primary: `var(--accent)` = protection green `#059669`
- Mobile-first (sellers use phones), bottom nav on <768px, sidebar on >=768px
- Theme classes: `theme-dark` = actual dark mode, `theme-light` = warm light (default)
- All colors via CSS variables in `globals.css` — no raw hex in components
- Multi-language: Arabic (default), French, English
- Design DNA: Stripe Dashboard + Linear + high-end fintech operations

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

---

# 🏗️ PERMANENT ENGINEERING PRINCIPLES

These are non-negotiable. They define how UGZIO evolves.

---

## 🧱 Architecture Law

**UI → Service → Prisma. ONLY.**

- No additional layers
- No managers, coordinators, orchestrators
- No repository pattern (Prisma IS your repository)
- No DDD, CQRS, Event Sourcing

If a feature needs more than 2 layers → simplify it.

---

## 🚫 Product Firewall

### What UGZIO IS:
- Revenue protection operating system
- Failed delivery prevention layer
- Operator decision system
- Risk-based confirmation workflow

### What UGZIO IS NOT:
- ❌ Inventory management
- ❌ Customer support CRM
- ❌ Ad management
- ❌ Generic analytics dashboards
- ❌ Accounting
- ❌ Marketing automation
- ❌ Multi-product expansion platform

### Feature Admission Rule
Every future feature must answer YES to at least ONE:
1. Does this reduce failed deliveries?
2. Does this protect revenue?
3. Does this accelerate operator decisions?
4. Does this improve trust/risk intelligence?
5. Does this strengthen the core operational loop?

**If NO → REJECT THE FEATURE.**

---

## 🔄 The Core Loop

```
Order enters → Risk evaluated → Operator action → Customer outcome → Revenue outcome → Learning signal
```

Every feature must connect to this loop.

---

## 🎨 Design System Governance

**ONE visual system. Forever.**

- All pages use CSS variables from `globals.css`
- All cards use `rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4`
- All KPIs use `KpiCard` / `MiniKpiCard`
- No raw hex colors in components
- No custom gradients, shadows, animations

Forbidden:
- ❌ Random gradients
- ❌ Random colors
- ❌ Custom page styles
- ❌ Competing card systems

---

## 🛡️ Safe Render Rules

**NEVER throw in the UI render path.**

- All server functions wrap in try/catch
- All services return empty defaults on failure
- Never return `undefined` for arrays/collections
- Mutations return `{ success: boolean }`
- Use `safeAsync`, `safeSync`, `safeFallback` from `@/lib/core/safe-render.ts`

---

## 📁 Routing Architecture

### Approved route groups ONLY:
- `(app)` → Authenticated operational system
- `(auth)` → Login/register
- `(marketing)` → Landing page

### Approved operational states ONLY:
- `/overview` → LIVE (what's happening now)
- `/confirm` → DECISION (what needs attention)
- `/orders` → HISTORY (what happened)
- `/orders/import` → INGESTION (bring data in)
- `/settings/delivery` → ECONOMICS (configure costs)

### Auxiliary routes (configuration / secondary features):
- `/settings/*` → Configuration pages (branding, connectivity, security, ugc)
- `/inbox` → UGC review (part of core loop)
- `/blacklist` → Risk management
- `/growth` → Growth metrics

All other routes in `(app)` redirect to `/overview`.

**No orphaned pages. No experimental routes. No duplicate trees.**
- Redundant duplicates: `/dashboard`, `/operations`, `/intelligence`, `/success`, `/shield`, `/orders/new` — all deleted

---

## 📝 Complexity Budget

### Hard Limits:
- Maximum 2 architecture layers
- No parallel state systems
- No duplicated logic
- No orchestration layer beyond demo-orchestrator (which is just a router)

### Complexity Budget Formula:
```
Complexity Cost = (New Files) + (New Services) × 2 + (New Models) × 3
Operational Value = (Revenue Protected) + (Failed Deliveries Prevented) + (Faster Decisions)

If Cost > Value → REJECT.
```

---

## 🔌 Integration Rules

### Approved Integration Order:
1. Shopify / ecommerce
2. WhatsApp Cloud API
3. SMS
4. Delivery Provider APIs

### Integration Must:
- Feed the core loop
- Not create new product categories
- Stay isolated in services
- Fail safely

### Integration Must NOT:
- WhatsApp is NOT a chat app → it's a confirmation channel
- Shopify is NOT an ecommerce platform → it's an order source
- Delivery APIs are NOT a shipping system → they're an outcome source

---

## 🧠 Decision Framework

When unsure about anything:

### Step 1: Check the Product Firewall
- Does this fit what UGZIO IS?
- Does this serve the core loop?

### Step 2: Check the Architecture Law
- Does this fit UI → Service → Prisma?
- No extra layers?

### Step 3: Check the Complexity Budget
- Cost < Value?

### Step 4: When in Doubt
- **Simplify**
- **Delete code**
- **Ask: Does this make operators faster at protecting revenue?**

**If not → STOP.**

---

## 📚 Governing Documents

Before making ANY changes, read these:

1. **`docs/product-firewall.md`** — What UGZIO is and is NOT
2. **`docs/core-loop.md`** — The central product truth
3. **`docs/service-architecture.md`** — UI → Service → Prisma only
4. **`docs/render-safety.md`** — Never throw in UI path
5. **`docs/routing-rules.md`** — Approved routes only
6. **`docs/design-system.md`** — One visual system
7. **`docs/complexity-limiter.md`** — Max 2 layers
8. **`docs/integration-strategy.md`** — Integrations feed the loop
9. **`docs/architecture-rules.md`** — Stability rules
10. **`docs/schema-change-checklist.md`** — Prisma migrations
11. **`docs/prisma-migration-rules.md`** — Database safety

---

---

# 🧠 Session 1 Feature Spec (from memory — verify before implementing)

## Magic Link (Buyer Experience)
- **Buyers never download** — No app. Everything via branded magic link
- **Seller branding** — Magic link shows seller name/logo, not UGZIO
- **CTA** — Clear action button (confirm, track, etc.)
- **Product suggestion** — Recommandation produit sur la page magic link
- **First wow moment** — La première expérience du buyer doit être impressionnante (emotion, confiance, célébration)

## Post-Registration Popup
- Après une nouvelle inscription → popup pour:
  - Décrire la marque (brand description)
  - Connecter les réseaux sociaux
  - Connecter WhatsApp
- (Current onboarding only asks for shop name + phone — incomplete)

## Pricing (MUST FIX)
- **Current**: Free (0dt) + Croissance (129dt)
- **Should be**: Free (0dt) + 49dt + 139dt (3 plans, not 2)
- Missing middle tier at 49dt

---

## ⚡ Success Principles Summary

1. **Simplicity over abstraction** — Direct function calls > patterns
2. **Explicit over magic** — No clever metaprogramming
3. **Operational clarity over feature count** — More features = more bloat
4. **Stable systems over clever systems** — Predictable > impressive
5. **Core loop first** — Everything else is secondary
6. **Revenue impact first** — If it doesn't protect revenue, why build it?
