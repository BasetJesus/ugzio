import Hero from "@/components/landing/Hero";
import LiveDemo from "@/components/landing/LiveDemo";
import HowItWorks from "@/components/landing/HowItWorks";
import Benefits from "@/components/landing/Benefits";
import OperationsPreview from "@/components/landing/OperationsPreview";
import CTA from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <LiveDemo />
      <HowItWorks />
      <Benefits />
      <OperationsPreview />
      <CTA />
    </>
  );
}
