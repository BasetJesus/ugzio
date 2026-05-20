import PageTracker from "@/components/shared/PageTracker"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="auto" style={{ backgroundColor: "#0a0a0a" }} className="h-dvh overflow-y-auto">
      <PageTracker page="landing" />
      {children}
    </div>
  )
}
