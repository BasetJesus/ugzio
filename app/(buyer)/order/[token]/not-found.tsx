export default function BuyerOrderNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] text-center px-6 animate-fade-in">
      <div className="text-5xl mb-4">📭</div>
      <h1 className="text-lg font-bold text-white mb-2">
        Commande introuvable
      </h1>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
        Cette commande n&apos;existe pas ou a été supprimée.
        Contactez le vendeur sur WhatsApp pour plus d&apos;informations.
      </p>
    </div>
  )
}
