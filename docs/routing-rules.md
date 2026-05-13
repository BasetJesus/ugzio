# UGZIO Routing Architecture Rules

> UGZIO IS ONE OPERATIONAL SYSTEM — NOT DISCONNECTED PAGES.

Every route must connect to the core operational states. No orphaned pages.

---

## Approved Route Groups

Next.js App Router groups MUST be:

```
(app)        ← Authenticated operational system (CoreShell)
(auth)       ← Login/register (centered layout)
(marketing)  ← Landing page (public)
```

NO other route groups allowed.

---

## Operational States Mapping

UGZIO has **5 core operational states**. Every authenticated route maps to exactly one state.

| State | Route | Purpose | Data State |
|-------|-------|---------|------------|
| **LIVE** | `/overview` | What's happening now | Revenue at risk, Today's outcomes |
| **DECISION** | `/confirm` | What needs my attention | Confirmation queue, action buttons |
| **HISTORY** | `/orders` | What happened | Order history, filters |
| **INGESTION** | `/orders/import` | Bring data in | CSV upload, validation |
| **ECONOMICS** | `/settings/delivery` | Configure costs | Provider RTS cost, delivery days |

### Redirect Rules

All other routes in `(app)` redirect to `/overview`:

- `/dashboard` → `/overview`
- `/operations` → `/overview`
- `/shield` → `/overview`
- `/inbox` → `/overview`
- `/success` → `/overview`
- `/blacklist` → `/overview`

These are **placeholders only**. If you want to activate one, it must map to one of the 5 core states above.

---

## Routing Philosophy

### One Layout to Rule Them All

All `(app)` routes use **CoreShell** layout:

```
CoreShell
├── LiveSystemHeader (top bar — revenue at risk indicator)
├── SystemFlowNavigator (desktop sidebar — LIVE / DECISION / HISTORY)
├── MobileBottomNav (mobile bottom — same 3 states)
└── Children (page content)
```

**NO page-specific layouts in `(app)`.**

### State Navigation is Primary

Navigation should always:
1. Show the 3 core states first (LIVE / DECISION / HISTORY)
2. Show secondary actions (import, settings) as secondary
3. Never prioritize "features" over operational states

### Forbidden Routing Patterns

1. **No nested dashboards**
   ```
   BAD: /dashboard/overview
        /dashboard/operations
        /dashboard/analytics

   GOOD: /overview
         /confirm
         /orders
   ```

2. **No duplicate route trees**
   ```
   BAD: /operations/orders
        /shield/orders
        /dashboard/orders

   GOOD: /orders (one source of truth)
   ```

3. **No experimental route groups**
   ```
   BAD: (ai-features)
        (analytics)
        (beta)

   GOOD: Routes only in (app), (auth), (marketing)
   ```

4. **No orphaned pages**
   - Every page in `(app)` must be reachable via CoreShell navigation
   - No "secret" pages only accessible via URL
   - No dead-end pages

---

## Current Route Inventory

### Authenticated Routes (`(app)`)

| Route | Status | State | Notes |
|-------|--------|-------|-------|
| `/overview` | ✅ Active | LIVE | Primary operational view |
| `/confirm` | ✅ Active | DECISION | Confirmation queue |
| `/orders` | ✅ Active | HISTORY | Order history |
| `/orders/import` | ✅ Active | INGESTION | CSV upload |
| `/orders/new` | ✅ Active | INGESTION | Manual order form |
| `/orders/[id]` | ✅ Active | HISTORY | Order detail |
| `/settings/delivery` | ✅ Active | ECONOMICS | Provider config |
| `/dashboard` | 🔄 Redirect | - | → `/overview` |
| `/operations` | 🔄 Redirect | - | → `/overview` |
| `/shield` | 🔄 Redirect | - | → `/overview` |
| `/inbox` | 🔄 Redirect | - | → `/overview` |
| `/success` | 🔄 Redirect | - | → `/overview` |
| `/blacklist` | 🔄 Redirect | - | → `/overview` |

### Auth Routes (`(auth)`)

| Route | Purpose | Layout |
|-------|---------|--------|
| `/login` | Login form | Centered auth layout |
| `/register` | Registration form | Centered auth layout |

### Onboarding (Special)

| Route | Purpose | State |
|-------|---------|-------|
| `/onboarding` | First-time org setup | Pre-app, redirects if org exists |

---

## Adding a New Route

When you need a new route:

### Step 1: Map to a Core State

Which state does this belong to?

- **LIVE** (`/overview`) — Real-time metrics, what's happening now
- **DECISION** (`/confirm`) — Action queue, decisions to make
- **HISTORY** (`/orders`) — Historical records, search, filters
- **INGESTION** (`/orders/import`) — Bringing data into the system
- **ECONOMICS** (`/settings/delivery`) — Configuring costs, providers

### Step 2: Follow Naming Convention

- Use kebab-case: `/orders/import`, `/settings/delivery`
- No camelCase, no snake_case in routes
- Resource first, action second: `/orders/new` not `/new-order`

### Step 3: Check Navigation

- Can operators reach this page via CoreShell?
- Does it fit in SystemFlowNavigator or MobileBottomNav?
- If not, should it be under Settings instead?

### Step 4: Verify No Duplication

- Is this functionality already covered by another route?
- Would this create a parallel logic path?
- Can this be a tab/filter on an existing page instead?

---

## API Routes

### Location

All API routes in:
```
/app/api/v1/...
```

### Naming Convention

```
/api/v1/orders          GET, POST
/api/v1/orders/[id]     GET, PATCH, DELETE
/api/v1/orders/import   POST
/api/v1/settings/delivery      GET, POST
/api/v1/settings/delivery/[id] GET, PATCH, DELETE
```

### Rules

1. **Versioned** — Always `/api/v1/`, never just `/api/`
2. **Resource-oriented** — `/api/v1/orders` not `/api/v1/getOrders`
3. **HTTP methods matter**:
   - `GET` — Read only
   - `POST` — Create
   - `PATCH` — Partial update
   - `DELETE` — Remove
4. **No RPC endpoints disguised as REST**
   - BAD: `/api/v1/cancelOrder?id=123`
   - GOOD: `POST /api/confirm/[orderId]` with `{ action: "cancel" }`

---

## Layout Rules

### CoreShell Layout (`(app)`)

All pages in `(app)` use this layout. It provides:

- Session validation
- Organization resolution
- Revenue at risk indicator (top bar)
- State navigation (sidebar / bottom nav)
- Theme provider
- Language provider

**NO page in `(app)` should have its own layout.**

### Auth Layout (`(auth)`)

Login/register pages use a centered, minimal layout.

**No CoreShell, no navigation.**

### Root Layout

Root layout (`app/layout.tsx`) provides:
- Font loading
- Theme provider wrapper
- Global styles (globals.css)
- HTML structure

---

## Forbidden: Dynamic Routes Without Purpose

Before creating a dynamic route like `/foo/[id]`, ask:

1. Is this a real resource that needs its own page?
2. Could this be a modal/side drawer on an existing page?
3. Does every operator need to access this directly via URL?

**Example**: Order detail (`/orders/[id]`) is valid because:
- Operators bookmark specific orders
- Deep links in notifications
- Audit trail needs permanent URLs

**Bad example**: A separate page for each risk signal type
- Operators don't bookmark "high risk for this city"
- Should be filters on `/orders` instead

---

## Remember

> Routes should tell a story:
> "I need to see what's happening" → `/overview`
> "I need to make decisions" → `/confirm`
> "I need to look up past orders" → `/orders`
> "I need to import new orders" → `/orders/import`
> "I need to configure my delivery costs" → `/settings/delivery`

If a route doesn't answer "why would an operator go here?" → it shouldn't exist.

---

## Route Change Checklist

Before adding/modifying a route:

- [ ] Does it map to one of the 5 core states?
- [ ] Is it using CoreShell layout?
- [ ] Is the URL following naming conventions?
- [ ] Is it reachable via navigation?
- [ ] Does it NOT duplicate existing functionality?
- [ ] Is the API (if any) versioned at `/api/v1/`?
