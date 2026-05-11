type VerificationState = "none" | "sent" | "confirmed" | "failed" | "expired";

const transitions: Record<VerificationState, VerificationState[]> = {
  none: ["sent"],
  sent: ["confirmed", "failed", "expired"],
  confirmed: [],
  failed: [],
  expired: [],
};

export function canTransition(from: VerificationState, to: VerificationState): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function transitionStatus(from: VerificationState, to: VerificationState): VerificationState {
  if (!canTransition(from, to)) throw new Error(`Invalid transition: ${from} → ${to}`);
  return to;
}
