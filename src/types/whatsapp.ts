export type SequenceType = "trust" | "reminder" | "urgency" | "reassurance"
export type ChannelType = "whatsapp" | "sms" | "call"
export type MessageTone = "calm" | "operational" | "soft_urgency" | "reassuring"

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
