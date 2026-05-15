import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
}

interface Stage {
  label: string
  done: boolean
  current: boolean
}

function getStages(order: BuyerOrderView): Stage[] {
  const status = order.status
  return [
    { label: "Commande passée", done: true, current: false },
    { label: "Confirmée", done: status !== "CREATED" && status !== "PRE_SHIPPING_CONFIRM_SENT", current: status === "PRE_SHIPPING_CONFIRM_SENT" || status === "BUYER_CONFIRMED" },
    { label: "Expédiée", done: status === "SHIPPED" || status === "DELIVERED" || status === "UGC_REQUESTED" || status === "UGC_RECEIVED", current: status === "SHIPPED" },
    { label: "Livrée", done: status === "DELIVERED" || status === "UGC_REQUESTED" || status === "UGC_RECEIVED", current: status === "DELIVERED" },
    { label: "Terminée", done: status === "UGC_RECEIVED", current: status === "UGC_REQUESTED" },
  ]
}

export default function BuyerDeliveryTimeline({ order }: Props) {
  const stages = getStages(order)

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
        Statut de la commande
      </p>
      <div className="space-y-0">
        {stages.map((stage, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  stage.done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : stage.current
                      ? "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30"
                      : "bg-[var(--bg-card)] text-[var(--text-tertiary)]"
                }`}
              >
                {stage.done ? "✓" : stage.current ? "●" : "○"}
              </div>
              {i < stages.length - 1 && (
                <div
                  className={`w-px h-6 ${
                    stage.done ? "bg-emerald-500/20" : "bg-[var(--bg-card)]"
                  }`}
                />
              )}
            </div>
            <div className="pb-4">
              <p
                className={`text-xs ${
                  stage.done
                    ? "text-emerald-400 font-medium"
                    : stage.current
                      ? "text-purple-300 font-medium"
                      : "text-[var(--text-tertiary)]"
                }`}
              >
                {stage.label}
              </p>
              {stage.current && (
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                  {order.phase === "pre_confirmation" && "En attente de votre confirmation"}
                  {order.phase === "confirmed" && "Préparation en cours"}
                  {order.phase === "shipped" && "En route vers vous"}
                  {order.phase === "delivered" && "Colis livré"}
                  {order.phase === "completed" && "Commande terminée"}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
