# UGZIO Integration Strategy

> INTEGRATIONS MUST FEED THE CORE LOOP.

They must NOT create new product categories or parallel workflows.

---

## Approved Integration Order

Integrations will be built in THIS ORDER. No skipping.

| Priority | Integration | Purpose | Feeds Core Loop |
|----------|-------------|---------|-----------------|
| **1** | Shopify (or general ecommerce) | Auto-import orders | ✅ Order enters loop |
| **2** | WhatsApp Cloud API | Send confirmations, receive replies | ✅ Operator action + outcome |
| **3** | SMS (Tunisie Telecom / Orange) | Fallback for WhatsApp | ✅ Contact attempts |
| **4** | Delivery Provider APIs | Poste Tunisienne, Aramex, etc. | ✅ Delivery outcome → learning signal |
| **5** | Payment Provider (Konnect) | Subscription billing | ⚠️ Billing only, separate loop |

---

## Integration Rules — NON-NEGOTIABLE

### Rule 1: Integrations Live in Services ONLY

```
UI → Service → Integration Client → External API
```

**Forbidden:**
- Integration code in pages/components
- Integration code in lib utilities (except pure HTTP clients)
- Direct API calls from UI

### Rule 2: Integrations Must Fail Safely

Every integration must:
1. Have try/catch around ALL external calls
2. Return empty/default values on failure
3. Never throw to UI layer
4. Log errors internally

```typescript
// GOOD
async function sendWhatsApp(phone: string, message: string) {
  try {
    const result = await whatsAppClient.sendMessage(phone, message)
    return { success: true, messageId: result.id }
  } catch (e) {
    console.error("[whatsapp] send failed:", e)
    return { success: false, error: "Failed to send" }
  }
}

// BAD
async function sendWhatsApp(phone: string, message: string) {
  return whatsAppClient.sendMessage(phone, message)  // ❌ Throws to caller
}
```

### Rule 3: Integrations Must Not Create New Product Categories

**WhatsApp integration is for:**
- Sending pre-delivery confirmations
- Receiving confirmation replies
- Status tracking (sent/delivered/read)

**WhatsApp integration is NOT for:**
- Building a full chat inbox
- Customer support system
- Marketing broadcasts
- Multi-channel support hub

### Rule 4: Integration Clients Are Isolated

Keep integration clients in separate files:

```
src/lib/whatsapp/client.ts        ← Pure HTTP client
src/lib/sms/tunisie-telecom.ts    ← Pure HTTP client
src/lib/shopify/client.ts          ← Pure HTTP client
```

**Services use these clients:**
```typescript
// protect.service.ts (uses WhatsApp client)
import { sendButtons } from "@/lib/whatsapp/client"

export async function sendVerification(orderId: string) {
  // ...
}
```

### Rule 5: Webhooks Go Through BullMQ

**Never process webhooks synchronously:**

```typescript
// GOOD — Queue for async processing
export async function POST(request: NextRequest) {
  const payload = await request.json()
  
  // 1. Idempotency check (WebhookLog)
  const existing = await prisma.webhookLog.findUnique({
    where: { eventId: payload.id }
  })
  if (existing) return NextResponse.json({ received: true })
  
  // 2. Log and queue
  await prisma.webhookLog.create({ data: { ... } })
  await criticalEventsQueue.add("WEBHOOK_RECEIVED", { payload })
  
  return NextResponse.json({ received: true })
}

// BAD — Process in request cycle
export async function POST(request: NextRequest) {
  const payload = await request.json()
  
  // ❌ Slow, can fail, blocks response
  await processShopifyOrder(payload)
  
  return NextResponse.json({ received: true })
}
```

---

## Shopify Integration (Priority 1)

### Purpose

Auto-import orders from Shopify instead of manual CSV.

### What It Feeds

```
Shopify webhook → Order created → Risk calculated → Confirmation queue
     ↓
ORDER_CREATED event → Full core loop activated
```

### Forbidden Features

**Shopify integration is NOT:**
- Inventory sync
- Product catalog management
- Order fulfillment (shipment tracking only if it feeds outcome)
- Customer management

### Data We Need From Shopify

| Field | Purpose |
|-------|---------|
| customer name / phone | Buyer identity + risk |
| order total | Amount at risk |
| shipping city | Wilaya signal |
| line items | Product name |
| created_at | Order timing |

### Data We DO NOT Need From Shopify

- Inventory levels
- Fulfillment status (initially)
- Customer history beyond what's in UGZIO
- Discount codes, taxes, shipping costs (unless included in amount)

---

## WhatsApp Integration (Priority 2)

### Current State

Mock exists in `contact-attempt.service.ts`:
- `mockSendWhatsApp()`
- `attemptContact()` with simulated outcomes

### Real Integration Purpose

Send psychological confirmation messages and receive buyer replies.

### Message Types (Approved)

1. **Pre-delivery confirm** — "Confirm you're available for delivery"
2. **Anticipation** — "Your order ships tomorrow"
3. **Social proof** — "Others loved this product"
4. **Visual ownership** — "Here's your order being prepared"

### What It Feeds

```
WhatsApp sent → Buyer replies → Status tracked → Outcome recorded
     ↓
Operator has better data → Better decisions → Revenue protected
```

### Forbidden Features

**WhatsApp integration is NOT:**
- Full chat inbox
- Customer support
- Marketing broadcasts
- Multi-agent team chat
- Template management UI (initially)

### Hard Limits

- Maximum 3-5 messages per order (psychological sequence only)
- No blast campaigns
- No 2-way chat beyond confirmation workflow

---

## Delivery Provider APIs (Priority 4)

### Purpose

Receive actual delivery outcomes to:
1. Close the learning loop
2. Improve risk scoring
3. Calculate real vs estimated RTS loss

### Approved Providers

1. **Poste Tunisienne** — Primary
2. **Aramex** — Secondary
3. **DHL / Chronopost** — Future

### What It Feeds

```
Delivery webhook → Order status updated → Outcome recorded
     ↓
Actual RTS / Delivered → Risk model learns → Better future scoring
```

### Forbidden Features

**Delivery provider integration is NOT:**
- Shipment tracking UI (initially)
- Label generation
- Rate shopping
- Multi-provider comparison

---

## Integration Client Pattern

Every integration client must follow this pattern:

```typescript
// src/lib/integration/client.ts

// 1. Types first
export interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

// 2. Client class (isolated, pure HTTP)
export class IntegrationClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = process.env.INTEGRATION_API_URL ?? ""
  }

  // 3. All methods return structured results, never throw
  async sendMessage(to: string, text: string): Promise<SendResult> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, text }),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      return { success: true, messageId: data.id }
    } catch (e) {
      console.error(`[integration] sendMessage failed:`, e)
      return { success: false, error: "Network error" }
    }
  }
}

// 4. Singleton getter (optional convenience)
let cachedClient: IntegrationClient | null = null

export function getIntegrationClient(): IntegrationClient {
  if (!cachedClient) {
    const apiKey = process.env.INTEGRATION_API_KEY
    if (!apiKey) {
      throw new Error("INTEGRATION_API_KEY required")
    }
    cachedClient = new IntegrationClient(apiKey)
  }
  return cachedClient
}
```

---

## Webhook Handling Pattern

```typescript
// app/api/webhooks/provider/route.ts

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { criticalEventsQueue } from "@/lib/events/queues"

export async function POST(request: NextRequest) {
  try {
    // 1. Get payload
    const payload = await request.json()
    const eventId = payload.id ?? `${Date.now()}`

    // 2. Idempotency check (CRITICAL)
    const existing = await prisma.webhookLog.findUnique({
      where: { eventId },
    })

    if (existing) {
      // Already processed — acknowledge but don't re-process
      return NextResponse.json({ received: true, duplicate: true })
    }

    // 3. Log the webhook first
    await prisma.webhookLog.create({
      data: {
        provider: "shopify", // or "whatsapp", "delivery"
        eventType: payload.type ?? "unknown",
        eventId,
        payload: JSON.stringify(payload),
        signature: request.headers.get("x-webhook-signature") ?? "",
        processed: false,
      },
    })

    // 4. Queue for async processing (NEVER process in request cycle)
    await criticalEventsQueue.add("WEBHOOK_RECEIVED", {
      provider: "shopify",
      eventId,
      payload,
    })

    // 5. Fast acknowledgment
    return NextResponse.json({ received: true })
  } catch (e) {
    console.error("[webhook] handler error:", e)
    // Still return 200 to prevent retries on our error
    return NextResponse.json({ received: true, error: "Internal" })
  }
}
```

---

## Integration Checklist

Before building ANY integration:

1. [ ] Does it feed the core loop?
   - Order enters → ✅
   - Risk calculated → ✅
   - Outcome tracked → ✅
   - Learning signal → ✅

2. [ ] Is it in the approved priority order?
   - Shopify before WhatsApp
   - WhatsApp before SMS
   - SMS before Delivery APIs

3. [ ] Does it live in services only?
   - No UI code making HTTP calls
   - No pages importing HTTP clients

4. [ ] Does it fail safely?
   - try/catch around all external calls
   - Returns structured `{ success: boolean }`
   - Never throws to UI

5. [ ] Does it avoid creating new product categories?
   - Not building a chat app for WhatsApp
   - Not building an inventory system for Shopify
   - Not building a shipping system for delivery APIs

---

## Remember

> Integrations are FEEDERS, not features.

WhatsApp integration doesn't make UGZIO a "chat app".
Shopify integration doesn't make UGZIO an "ecommerce platform".
Delivery API integration doesn't make UGZIO a "shipping system".

All integrations exist for ONE purpose:
> To make the core loop stronger.

**If it doesn't make the core loop stronger, it doesn't belong.**
