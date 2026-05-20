"use client"

import { Toaster } from "sonner"

export default function BrandToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "sonner-brand",
        style: {
          background: "#161A23",
          border: "1px solid #2A303C",
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          borderRadius: "12px",
          padding: "12px 16px",
          borderLeft: "3px solid #FFD700",
        },
      }}
      icons={{
        success: undefined,
        error: undefined,
        info: undefined,
      }}
    />
  )
}
