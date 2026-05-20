# UGZIO v4 — Revenue Protection Operating System

**GROW** + **PROTECT** — Two pillars. One platform.

UGZIO helps Tunisian ecommerce sellers grow faster and lose less — without hiring anyone, running paid ads, or manually chasing fake buyers.

## Architecture

| Layer | Tech | Purpose |
|---|---|---|
| Web App | Next.js 16 (App Router) | Routes, auth, state machine, webhooks, billing |
| Intelligence | Python (FastAPI) | OpenAI, ZioBrain inference, ML scoring |
| Event Bus | BullMQ (Redis) | Durable event processing |
| Database | PostgreSQL | Multi-tenant with RLS |
| Payments | Konnect | Tunisian payment gateway (no Stripe) |

## Sub-systems

### PROTECT Pillar
- **ZioShield** — Risk engine, trust scoring, fraud detection
- **ZioConfirm** — Buyer pre-delivery verification via magic link
- **ZioIdentity** — Behavioral memory, cross-order patterns
- **ZioGuard** — Shared blacklist across sellers

### GROW Pillar
- **ZioCapture** — UGC capture engine
- **ZioFlow** — Repost flywheel automation
- **ZioInbox** — UGC review & approval
- **ZioLearn** — Outcome learning & conversion insights
- **ZioView** — Growth metrics dashboard

## Order State Machine

```
CREATED → PRE_SHIPPING_CONFIRM_SENT → BUYER_CONFIRMED → SHIPPED → DELIVERED → UGC_REQUESTED → UGC_RECEIVED
INTELLIGENT_CANCEL | PENDING_RESCHEDULE | REFUSED
```

## Pricing

| Plan | Price | Orders/mo |
|---|---|---|
| ZioStart | 0 TND | 3 |
| ZioGrow | 29 TND | 500 |
| ZioPro | 79 TND | Unlimited |
| ZioMax | 399 TND | Unlimited, multi-brand |

## Getting Started

```bash
cp .env.example .env   # configure database, Redis, Konnect
npm install
npm run db:migrate
npm run db:seed
npm run dev            # http://localhost:3000
```

## Governing Docs

See `docs/` for architecture rules, product firewall, design system, and contribution guidelines.
