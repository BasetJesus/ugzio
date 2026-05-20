import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import RealitySection from "@/components/landing/RealitySection"
import LiveDemoSection from "@/components/landing/LiveDemoSection"
import PsychologySection from "@/components/landing/PsychologySection"
import UgcSection from "@/components/landing/UgcSection"
import OutcomeSection from "@/components/landing/OutcomeSection"
import PricingSection from "@/components/landing/PricingSection"
import FinalCtaSection from "@/components/landing/FinalCtaSection"
import Footer from "@/components/landing/Footer"
import PsychFlowSection from "@/components/landing/PsychFlowSection"
import TrustMetricsSection from "@/components/landing/TrustMetricsSection"
import CaptionDemoSection from "@/components/landing/CaptionDemoSection"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "UGZIO",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "UGZIO réduit les annulations ecommerce Tunisie. Automatisation post-achat, confiance acheteur, WhatsApp psychology engine.",
  offers: {
    "@type": "AggregateOffer",
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "TND" },
      { "@type": "Offer", name: "ZioGrow", price: "29", priceCurrency: "TND" },
      { "@type": "Offer", name: "ZioPro", price: "79", priceCurrency: "TND" },
      { "@type": "Offer", name: "ZioMax", price: "399", priceCurrency: "TND" },
    ],
  },
  author: {
    "@type": "Organization",
    name: "UGZIO",
  },
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PsychFlowSection />
        <RealitySection />
        <LiveDemoSection />
        <PsychologySection />
        <CaptionDemoSection />
        <UgcSection />
        <OutcomeSection />
        <PricingSection />
        <TrustMetricsSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  )
}
