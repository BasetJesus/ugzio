"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center rounded-xl border p-8" style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full mb-4" style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-[16px] font-bold text-white mb-1">Something went wrong</p>
            <p className="text-[12px] mb-4" style={{ color: "#6B7280" }}>This section encountered an error. Please try again.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="rounded-lg px-4 py-2 text-[12px] font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#FFD700", color: "#0B0D12" }}
            >
              Retry
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
