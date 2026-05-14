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

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <RealitySection />
        <LiveDemoSection />
        <PsychologySection />
        <UgcSection />
        <OutcomeSection />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  )
}
