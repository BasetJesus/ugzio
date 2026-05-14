import posthog from "posthog-js"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ""
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"

export function initAnalytics() {
  if (typeof window === "undefined") return
  if (!POSTHOG_KEY) return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
    persistence: "localStorage",
    loaded: () => {
      posthog.register({ app: "ugzio" })
    },
  })
}

export function trackPageVisit(page: string, meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  posthog.capture("page_visit", { page, ...meta })
}

export function trackBuyerAction(action: string, meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  posthog.capture("buyer_action", { action, ...meta })
}

export function trackWhatsAppClick(source: string, meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  posthog.capture("whatsapp_click", { source, ...meta })
}

export function trackConfirmation(orderId: string, meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  posthog.capture("order_confirmed", { orderId, ...meta })
}

export function trackFeedback(orderId: string, satisfaction: number, meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  posthog.capture("feedback_submitted", { orderId, satisfaction, ...meta })
}

export function trackReferralClick(orderId: string, meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  posthog.capture("referral_clicked", { orderId, ...meta })
}

export function trackUGCTrigger(orderId: string, meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  posthog.capture("ugc_triggered", { orderId, ...meta })
}
