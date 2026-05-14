import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
}

export default function BuyerOrderInfo({ order }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
        Récapitulatif de la commande
      </p>
      {order.product && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Produit</span>
          <span className="text-sm font-medium text-white text-right max-w-[60%] truncate">
            {order.product}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Montant</span>
        <span className="text-sm font-semibold text-white">
          {order.amount.toFixed(0)} {order.currency}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Paiement</span>
        <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
          Paiement à la livraison
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Destinataire</span>
        <span className="text-sm font-medium text-white">{order.buyerName}</span>
      </div>
      <div className="pt-2 border-t border-[var(--border)]">
        <p className="text-[10px] text-zinc-500">
          Commandé le {new Date(order.createdAt).toLocaleDateString("fr-TN", {
            day: "numeric", month: "long", year: "numeric"
          })}
        </p>
      </div>
    </div>
  )
}
