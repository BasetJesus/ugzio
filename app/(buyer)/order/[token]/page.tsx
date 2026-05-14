import { notFound } from "next/navigation"
import { getBuyerOrder } from "@/services/buyer-order.service"
import PageTracker from "@/components/shared/PageTracker"
import { getOrCreateReferral } from "@/services/referral.service"
import BuyerHero from "@/components/buyer/BuyerHero"
import BuyerTrustBadge from "@/components/buyer/BuyerTrustBadge"
import BuyerOrderInfo from "@/components/buyer/BuyerOrderInfo"
import BuyerConfirmationButton from "@/components/buyer/BuyerConfirmationButton"
import BuyerDeliveryTimeline from "@/components/buyer/BuyerDeliveryTimeline"
import BuyerDeliveryExpectation from "@/components/buyer/BuyerDeliveryExpectation"
import BuyerCelebration from "@/components/buyer/BuyerCelebration"
import BuyerUGCPrompt from "@/components/buyer/BuyerUGCPrompt"
import BuyerFeedback from "@/components/buyer/BuyerFeedback"
import BuyerReferralPrompt from "@/components/buyer/BuyerReferralPrompt"
import BuyerWhatsAppBar from "@/components/buyer/BuyerWhatsAppBar"
import BuyerFooter from "@/components/buyer/BuyerFooter"

interface Props {
  params: Promise<{ token: string }>
}

export default async function BuyerOrderPage({ params }: Props) {
  const { token } = await params
  const order = await getBuyerOrder(token)
  if (!order) notFound()

  const referral = await getOrCreateReferral(order.orderId)

  return (
    <div className="space-y-4 animate-fade-in">
      <PageTracker page="buyer_order" meta={{ phase: order.phase, status: order.status }} />
      <BuyerHero order={order} />
      <BuyerTrustBadge sellerName={order.sellerName} trustScore={order.trustScore} />
      <BuyerOrderInfo order={order} />
      <BuyerConfirmationButton orderId={order.orderId} />
      <BuyerDeliveryTimeline order={order} />
      <BuyerDeliveryExpectation estimatedDays={order.estimatedDeliveryDays} phase={order.phase} />
      <BuyerCelebration order={order} />
      <BuyerUGCPrompt order={order} />
      <BuyerFeedback order={order} />
      <BuyerReferralPrompt order={order} referralCode={referral?.code ?? null} />
      <BuyerWhatsAppBar order={order} />
      <BuyerFooter />
    </div>
  )
}
