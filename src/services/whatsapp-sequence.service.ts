import type { SequenceInput, SequenceDecision, PsychologyPreview } from "@/types/whatsapp";
import { trustSequence } from "@/lib/whatsapp/templates/trust";
import { reminderSequence } from "@/lib/whatsapp/templates/reminder";
import { urgencySequence } from "@/lib/whatsapp/templates/urgency";
import { reassuranceSequence } from "@/lib/whatsapp/templates/reassurance";

function isFirstTimeBuyer(trustScore: number, explicit?: boolean): boolean {
  if (explicit !== undefined) return explicit;
  return trustScore < 40;
}

const PSYCHOLOGY_MAP: Record<string, { psychologicalReason: string; expectedGoal: string }> = {
  trust: {
    psychologicalReason: "High trust buyer — maintain confidence with calm reassurance",
    expectedGoal: "Preserve buyer confidence and prevent last-minute hesitation",
  },
  reminder: {
    psychologicalReason: "Medium risk + no prior response — operational nudge needed",
    expectedGoal: "Ensure buyer is reachable and prepared for delivery",
  },
  urgency: {
    psychologicalReason: "High value at risk — reservation framing to prompt timely decision",
    expectedGoal: "Secure confirmation before shipping window closes",
  },
  reassurance: {
    psychologicalReason: "First-time buyer or low trust — reduce anxiety with clear signals",
    expectedGoal: "Build buyer confidence and reduce delivery refusal risk",
  },
};

export function decideSequence(input: SequenceInput): SequenceDecision {
  const ctx = {
    buyerName: input.buyerName,
    orderAmount: input.orderAmount,
  };

  const firstTimer = isFirstTimeBuyer(input.trustScore, input.firstTimeBuyer);
  const noResponse = (input.noResponseCount ?? 0) > 0;
  const highAmount = input.orderAmount > 150;
  const highRisk = input.riskLevel === "high";
  const mediumRisk = input.riskLevel === "medium";

  if (highRisk && highAmount) {
    const messages = urgencySequence(ctx);
    return {
      sequenceType: "urgency",
      tone: "soft_urgency",
      timing: {
        firstMessageDelayHours: 0,
        totalSequenceHours: 20,
        messageCount: messages.length,
      },
      messages,
      ...PSYCHOLOGY_MAP.urgency,
    };
  }

  if (firstTimer || (highRisk && input.trustScore < 50)) {
    const messages = reassuranceSequence(ctx);
    return {
      sequenceType: "reassurance",
      tone: "reassuring",
      timing: {
        firstMessageDelayHours: 0,
        totalSequenceHours: 24,
        messageCount: messages.length,
      },
      messages,
      ...PSYCHOLOGY_MAP.reassurance,
    };
  }

  if (mediumRisk && noResponse) {
    const messages = reminderSequence(ctx);
    return {
      sequenceType: "reminder",
      tone: "operational",
      timing: {
        firstMessageDelayHours: 0,
        totalSequenceHours: 20,
        messageCount: messages.length,
      },
      messages,
      ...PSYCHOLOGY_MAP.reminder,
    };
  }

  if (highRisk && !highAmount) {
    const messages = reassuranceSequence(ctx);
    return {
      sequenceType: "reassurance",
      tone: "reassuring",
      timing: {
        firstMessageDelayHours: 0,
        totalSequenceHours: 24,
        messageCount: messages.length,
      },
      messages,
      psychologicalReason: "High risk detected — reduce refusal with trust signals",
      expectedGoal: "Neutralize delivery anxiety before shipping",
    };
  }

  const messages = trustSequence(ctx);
  return {
    sequenceType: "trust",
    tone: "calm",
    timing: {
      firstMessageDelayHours: 0,
      totalSequenceHours: 24,
      messageCount: messages.length,
    },
    messages,
    ...PSYCHOLOGY_MAP.trust,
  };
}

export function getPsychologyPreview(input: SequenceInput): PsychologyPreview {
  const decision = decideSequence(input);
  return {
    sequenceType: decision.sequenceType,
    tone: decision.tone,
    psychologicalReason: decision.psychologicalReason,
    expectedGoal: decision.expectedGoal,
    previewMessage: decision.messages[0]?.text ?? "",
  };
}
