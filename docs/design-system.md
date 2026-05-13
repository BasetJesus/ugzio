# UGZIO Design System Governance

> ONE VISUAL SYSTEM. FOREVER.

No page-specific styles. No experimental UI. No color wars.

---

## Design Philosophy

UGZIO is an **operational system**, not a marketing website.

Design priorities:
1. **Clarity first** — Operators make fast decisions
2. **Consistency always** — Same patterns everywhere
3. **Mobile-first** — Sellers use phones
4. **Low cognitive load** — No visual noise

**Forbidden:** Gradients, shadows, animations that don't serve a purpose.

---

## Approved Color System

All colors live in CSS variables in `app/globals.css`.

**NEVER use raw hex/RGB in components.**

### Semantic Colors

| CSS Variable | Purpose | Use Case |
|--------------|---------|----------|
| `--bg-base` | Page background | `bg-[var(--bg-base)]` |
| `--bg-card` | Card background | `bg-[var(--bg-card)]` |
| `--bg-surface` | Inner surfaces | `bg-[var(--bg-surface)]` |
| `--accent` | Primary brand | Buttons, links |
| `--accent-hover` | Hover state | Button hover |
| `--border` | Default borders | Card borders |
| `--text-primary` | Headings, values | KPI numbers |
| `--text-secondary` | Labels, descriptions | KPI labels |
| `--text-tertiary` | Muted text | Metadata |
| `--risk-red` | Danger | High risk, errors |
| `--warning-amber` | Warning | Medium risk |
| `--success-green` | Success | Low risk, positive |
| `--kpi-red-bg` | High risk KPI | `KpiCard tier="high"` |
| `--kpi-red-border` | High risk border | KPI card border |
| `--warning-amber-bg` | Medium risk KPI | `KpiCard tier="medium"` |
| `--warning-amber-border` | Medium risk border | KPI card border |
| `--success-green-bg` | Low risk KPI | `KpiCard tier="low"` |
| `--success-green-border` | Low risk border | KPI card border |

### Theme Support

Two themes, same semantic variables:

| Variable | Dark Theme | Light Theme |
|----------|-------------|-------------|
| `--bg-base` | `#000000` | `#fafafa` |
| `--bg-card` | `rgba(39, 39, 42, 0.5)` | `#ffffff` |
| `--accent` | `#9333ea` (purple-600) | `#9333ea` |
| `--border` | `rgba(63, 63, 70, 0.8)` | `#e4e4e7` |

**Components never need to know which theme is active.** They just use the variables.

---

## Approved Components

These are the ONLY UI building blocks.

### KpiCard (`src/components/shared/KpiCard.tsx`)

The most important component. Used everywhere.

```tsx
import KpiCard, { MiniKpiCard } from "@/components/shared/KpiCard"

// Full KPI Card
<KpiCard
  label="Revenue at risk"
  value={`${amount} TND`}
  icon="⚠️"
  tier="high"  // "high" | "medium" | "low" | "neutral"
/>

// Mini variant (for grids)
<MiniKpiCard
  label="Confirmation rate"
  value={`${rate}%`}
  tier="low"
/>
```

**Tier mapping:**
- `high` → Red (risk, danger)
- `medium` → Amber (warning, pending)
- `low` → Green (success, positive)
- `neutral` → Default (no semantic meaning)

### CoreShell (`src/components/core/CoreShell.tsx`)

The authenticated app layout. **All `(app)` pages use this.**

Provides:
- LiveSystemHeader (top bar with revenue at risk)
- SystemFlowNavigator (desktop sidebar)
- MobileBottomNav (mobile bottom navigation)
- Animation system

**Never create a custom layout for `(app)` pages.**

### EmptyState (`src/components/shared/EmptyState.tsx`)

Show when data is empty.

```tsx
<EmptyState
  icon="📦"
  title="No orders yet"
  description="Import your first order to get started"
  action={{ label: "Import Orders", href: "/orders/import" }}
/>
```

**Never leave blank white space.**

### LoadingSkeleton (`src/components/shared/LoadingSkeleton.tsx`)

Show while loading.

```tsx
import LoadingSkeleton from "@/components/shared/LoadingSkeleton"

if (loading) {
  return <LoadingSkeleton variant="card" count={3} />
}
```

Variants:
- `"card"` — Card skeletons
- `"list"` — List items
- `"chart"` — Chart area

---

## Card System

ONE card style. Forever.

```tsx
// The ONLY approved card pattern
<div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
  {/* Content */}
</div>
```

### KpiCard Variant (Tiered)

KpiCard handles its own styling. Use it directly.

### Forbidden Card Patterns

```tsx
// ❌ NEVER do this
<div className="rounded-2xl shadow-lg bg-gradient-to-br from-purple-900 to-black">
  {/* Custom card */}
</div>

// ❌ NEVER add custom shadows
<div className="rounded-xl shadow-xl">...</div>

// ❌ NEVER add custom gradients
<div className="bg-gradient-to-r">...</div>
```

---

## Spacing System

ONE spacing scale. Based on Tailwind but used consistently.

| Class | Pixels | Use Case |
|-------|--------|----------|
| `p-4` | 16px | Default card padding |
| `p-5` | 20px | Card padding (sm breakpoint) |
| `gap-3` | 12px | Between cards |
| `gap-4` | 16px | Between sections |
| `space-y-4` | 16px | Between page elements |
| `mt-1` | 4px | Between label and value |
| `mt-2` | 8px | Between sections |

### Page Layout Pattern

```tsx
export default function MyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Page Title</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Subtitle</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard ... />
        <KpiCard ... />
        <KpiCard ... />
      </div>

      {/* Content Card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
        {/* Content */}
      </div>
    </div>
  )
}
```

---

## Typography System

ONE set of text styles.

### Headings

```tsx
// Page title
<h1 className="text-xl font-bold text-[var(--text-primary)]">Title</h1>

// Section title
<h2 className="text-sm font-semibold text-[var(--text-primary)]">Section</h2>

// Card title
<h3 className="text-base font-semibold text-[var(--text-primary)]">Card</h3>
```

### Values

```tsx
// KPI value (large, bold)
<p className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>

// Secondary value
<p className="text-base font-bold text-[var(--text-primary)]">{value}</p>

// Small value
<p className="text-sm font-medium text-[var(--text-primary)]">{value}</p>
```

### Labels

```tsx
// KPI label
<p className="text-[11px] font-medium uppercase tracking-wider opacity-70 text-[var(--text-tertiary)]">
  Label
</p>

// Secondary text
<p className="text-xs text-[var(--text-secondary)]">Description</p>

// Muted text
<p className="text-[10px] text-[var(--text-tertiary)]">Metadata</p>
```

### Forbidden Typography

```tsx
// ❌ Custom font sizes
<p className="text-[14px]">...</p>  // Use text-xs, text-sm, etc.

// ❌ Custom font weights
<p className="font-extrabold">...</p>  // Use font-medium, font-semibold, font-bold

// ❌ Raw colors
<p className="text-purple-500">...</p>  // Use text-[var(--accent)] or semantic colors
```

---

## Button System

ONE button style.

### Primary Button

```tsx
// Primary action (purple)
<button className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors">
  Action
</button>
```

### Secondary Button (Border)

```tsx
// Cancel / back
<button className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]/30 transition-colors">
  Cancel
</button>
```

### Danger Button

```tsx
// Cancel order / prevent loss
<button className="rounded-lg border border-[var(--risk-red)]/30 px-4 py-2 text-xs font-medium text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] transition-colors">
  Prevent Loss
</button>
```

### Success Button

```tsx
// Confirm / secure revenue
<button className="rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-500 transition-colors">
  Secure Revenue
</button>
```

### Warning Button

```tsx
// Retry / re-contact
<button className="rounded-lg border border-[var(--warning-amber)]/30 px-4 py-2 text-xs font-medium text-[var(--warning-amber)] hover:bg-[var(--warning-amber-bg)] transition-colors">
  Re-contact
</button>
```

---

## Grid System

### KPI Cards (3-column)

```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <KpiCard ... />
  <KpiCard ... />
  <KpiCard ... />
</div>
```

### Mini KPIs (4-column)

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  <MiniKpiCard ... />
  <MiniKpiCard ... />
  <MiniKpiCard ... />
  <MiniKpiCard ... />
</div>
```

### Content Cards (1-column)

Most content is single column on mobile, still single column on desktop.

```tsx
<div className="space-y-3">
  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
    {/* Content */}
  </div>
  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
    {/* Content */}
  </div>
</div>
```

---

## Animation System

**Only approved animations.** No custom animations.

### Approved Animation Classes

From `app/globals.css`:

| Class | Purpose | Use Case |
|-------|---------|----------|
| `animate-view-fade-in` | Page transition | Content entering |
| `animate-view-fade-out` | Page transition | Content leaving |
| `animate-slide-in-right` | Side drawer | RiskInsightPanel |
| `animate-slide-in-top` | Toast/notification | Action feedback |
| `animate-fade-in` | Simple fade | Elements appearing |
| `animate-pulse` | Attention | High-risk indicator |

### Forbidden: Custom Animations

```tsx
// ❌ NEVER do this
<div className="transition-all duration-500 ease-in-out hover:scale-105">...</div>

// ❌ NEVER add custom keyframes
// @keyframes custom-bounce { ... }
```

---

## Risk Colors (Semantic)

These are used consistently across the app.

| Risk Level | Color Class | Text | Border | Background |
|------------|-------------|------|--------|------------|
| **High** | `--risk-red` | `text-[var(--risk-red)]` | `border-[var(--kpi-red-border)]` | `bg-[var(--kpi-red-bg)]` |
| **Medium** | `--warning-amber` | `text-[var(--warning-amber)]` | `border-[var(--warning-amber-border)]` | `bg-[var(--warning-amber-bg)]` |
| **Low** | `--success-green` | `text-[var(--success-green)]` | `border-[var(--success-green-border)]` | `bg-[var(--success-green-bg)]` |

### Usage Pattern

```tsx
function riskColor(level: string): string {
  switch (level) {
    case "high": return "text-[var(--risk-red)]"
    case "medium": return "text-[var(--warning-amber)]"
    default: return "text-[var(--success-green)]"
  }
}

function riskTier(level: string): "high" | "medium" | "low" {
  return level as "high" | "medium" | "low"
}
```

---

## Forbidden UI Patterns

### ❌ No Gradients

```tsx
// BAD
<div className="bg-gradient-to-br from-purple-900 to-black">...</div>

// GOOD
<div className="bg-[var(--bg-card)]">...</div>
```

### ❌ No Custom Shadows

```tsx
// BAD
<div className="shadow-lg shadow-xl">...</div>

// GOOD
<div className="border border-[var(--border)]">...</div>
```

### ❌ No Random Colors

```tsx
// BAD
<p className="text-blue-500 text-orange-400">...</p>

// GOOD
<p className="text-[var(--text-secondary)] text-[var(--accent)]">...</p>
```

### ❌ No Competing Card Systems

```tsx
// BAD (multiple card styles)
<div className="rounded-lg p-3">...</div>
<div className="rounded-2xl p-6">...</div>

// GOOD (one pattern)
<div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">...</div>
```

### ❌ No Experimental Components

If a component isn't in this list, it shouldn't exist:

- KpiCard / MiniKpiCard
- CoreShell
- EmptyState
- LoadingSkeleton
- Basic HTML elements styled with CSS variables

**No fancy charts.**
**No complex data tables.**
**No interactive widgets.**

---

## New Component Checklist

Before creating a new component:

1. [ ] Does this need to exist?
   - Can it be a div with existing classes?
   - Is it used in 3+ places?

2. [ ] Does it use CSS variables?
   - No raw hex colors
   - No custom gradients
   - Uses `--bg-base`, `--bg-card`, `--border`, etc.

3. [ ] Does it follow spacing conventions?
   - Uses `p-4`, `gap-4`, `space-y-6`, etc.
   - No custom margins/paddings

4. [ ] Is it mobile-first?
   - Works on 360px width
   - Touch targets at least 44px

5. [ ] Does it have a clear purpose?
   - One component = one responsibility
   - No "do everything" components

---

## Remember

> UGZIO is not Dribbble.
> It's not Awwwards.
> It's an operating system.

Operators need to:
1. See what's at risk
2. Make a decision
3. Get back to work

**Clarity > Beauty**
**Speed > Polish**
**Consistency > Variety**

Every UI decision must answer:
> Does this help the operator make a faster, better decision?

If not, it doesn't belong.
