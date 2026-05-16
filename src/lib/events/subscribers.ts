import { on } from "./event-bus"
import { EventType } from "./taxonomy"
import type { OrderCreatedPayload, OrderStatusChangedPayload, RiskScoredPayload, RiskOrderFlaggedPayload } from "./taxonomy"

let registered = false

export function registerCoreSubscribers(): void {
  if (registered) return
  registered = true

  on(EventType.ORDER_CREATED, (payload: OrderCreatedPayload) => {
    console.log(`[EventBus] Order created: ${payload.orderId} — ${payload.buyerName} (${payload.amount} TND)`)
  })

  on(EventType.ORDER_STATUS_CHANGED, (payload: OrderStatusChangedPayload) => {
    console.log(`[EventBus] Order updated: ${payload.orderId} — ${payload.previousStatus} → ${payload.newStatus}`)
  })

  on(EventType.RISK_SCORED, (payload: RiskScoredPayload) => {
    if (payload.riskLevel === "high") {
      console.log(`[EventBus] High risk alert: ${payload.orderId} — score ${payload.riskScore}, signals: [${payload.signals.join(", ")}]`)
    } else {
      console.log(`[EventBus] Risk calculated: ${payload.orderId} — ${payload.riskLevel} (${payload.riskScore})`)
    }
  })

  on(EventType.RISK_ORDER_FLAGGED, (payload: RiskOrderFlaggedPayload) => {
    console.log(`[EventBus] Order flagged: ${payload.orderId} — ${payload.buyerName} (${payload.buyerPhone}), risk ${payload.riskScore}`)
  })
}
