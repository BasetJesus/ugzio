"use client"

import { useEffect } from "react"
import { trackPageVisit } from "@/lib/analytics"

interface Props {
  page: string
  meta?: Record<string, unknown>
}

export default function PageTracker({ page, meta }: Props) {
  useEffect(() => { trackPageVisit(page, meta) }, [page, meta])
  return null
}
