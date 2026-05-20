export function SkeletonMetricCard() {
  return (
    <div
      className="relative overflow-hidden rounded-xl border p-5 min-h-[120px]"
      style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="h-8 w-8 rounded-full shimmer-base" />
        <div className="h-3 w-24 rounded shimmer-base" />
      </div>
      <div className="h-7 w-20 rounded shimmer-base mb-2" />
      <div className="h-3 w-16 rounded shimmer-base" />
      <div className="absolute inset-0 shimmer-overlay" />
    </div>
  )
}

export function SkeletonTableRow({ columns = 6 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 flex-1 rounded shimmer-base" />
      ))}
    </div>
  )
}

export function SkeletonActivity() {
  return (
    <div className="flex items-start gap-3 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="h-8 w-8 rounded-full shrink-0 shimmer-base" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded shimmer-base" />
        <div className="h-3 w-1/2 rounded shimmer-base" />
      </div>
      <div className="h-3 w-12 rounded shimmer-base shrink-0" />
    </div>
  )
}

export function SkeletonDetailPanel() {
  return (
    <div className="flex flex-col h-full p-5 space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-5 w-24 rounded shimmer-base" />
        <div className="h-5 w-16 rounded-full shimmer-base" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full shimmer-base" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-28 rounded shimmer-base" />
          <div className="h-3 w-20 rounded shimmer-base" />
        </div>
      </div>
      <div className="flex flex-col items-center py-4">
        <div className="h-20 w-20 rounded-full shimmer-base" />
      </div>
      <div className="h-24 rounded-xl shimmer-base" />
    </div>
  )
}


