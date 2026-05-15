export type SequenceType = "trust" | "reminder" | "urgency" | "reassurance"
export type ChannelType = "whatsapp" | "sms" | "call"
export type MessageTone = "calm" | "operational" | "soft_urgency" | "reassuring"

// ─── WhatsApp Connection State ────────────────────────────────────────────────
export type ConnectionStatus = "connected" | "disconnected" | "pending" | "expired"

export interface WhatsAppConnectionState {
  status: ConnectionStatus
  phoneNumber?: string
  phoneNumberId?: string
  hasAccessToken?: boolean
  connectedAt?: string
  expiresAt?: string
}

// ─── Message Session State ────────────────────────────────────────────────────
export type SessionStatus = "sent" | "opened" | "replied" | "ignored"

export interface MessageSession {
  orderId: string
  buyerName: string
  buyerPhone: string
  status: SessionStatus
  messageCount: number
  lastActivityAt: string
  orderAmount: number
}

// ─── Deep Link Templates ──────────────────────────────────────────────────────
export type Locale = "darija" | "french"
export type PsychologyTemplateKey = "trust" | "reminder" | "urgency" | "reassurance"

export interface PsychologyTemplate {
  key: PsychologyTemplateKey
  label: string
  description: string
  messages: Record<Locale, string>
}

export interface WhatsAppDeepLink {
  url: string
  message: string
  templateKey: PsychologyTemplateKey
  locale: Locale
}

// ─── Communication Performance ────────────────────────────────────────────────
export interface CommunicationPerformance {
  replyRate: number
  confirmationImprovement: number
  unreachableReduction: number
  rtsImpact: number
  totalSent: number
  totalReplied: number
  totalConfirmed: number
  totalUnreachable: number
}

export interface MessageTemplate {
  id: string
  text: string
  delayHours: number
  tone: MessageTone
}

export interface SequenceInput {
  riskLevel: string
  trustScore: number
  orderAmount: number
  buyerName: string
  city?: string
  firstTimeBuyer?: boolean
  deliveryProvider?: string
  noResponseCount?: number
  previousConfirmationAttempts?: number
}

export interface SequenceDecision {
  sequenceType: SequenceType
  tone: MessageTone
  timing: {
    firstMessageDelayHours: number
    totalSequenceHours: number
    messageCount: number
  }
  messages: MessageTemplate[]
  psychologicalReason: string
  expectedGoal: string
}

export interface PsychologyPreview {
  sequenceType: SequenceType
  tone: MessageTone
  psychologicalReason: string
  expectedGoal: string
  previewMessage: string
}

export interface ContactChannel {
  type: ChannelType
  enabled: boolean
  priority: number
  label: string
}
