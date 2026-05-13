import { on } from "./event-bus"
import type { OrderCreatedPayload, OrderUpdatedPayload, RiskCalculatedPayload, OrderFlaggedPayload } from "./event-bus"

let registered = false

export function registerCoreSubscribers(): void {
  if (registered) return
  registered = true

  on("ORDER_CREATED", (payload: OrderCreatedPayload) => {
    console.log(`[EventBus] Order created: ${payload.orderId} — ${payload.buyerName} (${payload.amount} TND)`)
  })

  on("ORDER_UPDATED", (payload: OrderUpdatedPayload) => {
    console.log(`[EventBus] Order updated: ${payload.orderId} — ${payload.previousStatus} → ${payload.newStatus}`)
  })

  on("RISK_CALCULATED", (payload: RiskCalculatedPayload) => {
    if (payload.riskLevel === "high") {
      console.log(`[EventBus] High risk alert: ${payload.orderId} — score ${payload.riskScore}, signals: [${payload.signals.join(", ")}]`)
    } else {
      console.log(`[EventBus] Risk calculated: ${payload.orderId} — ${payload.riskLevel} (${payload.riskScore})`)
    }
  })

  on("ORDER_FLAGGED", (payload: OrderFlaggedPayload) => {
    console.log(`[EventBus] Order flagged: ${payload.orderId} — ${payload.buyerName} (${payload.buyerPhone}), risk ${payload.riskScore}`)
  })
}
