import type { ConfirmationAttemptItem } from "@/services/confirmation.service";

const OUTCOME_META: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Confirmed", color: "text-green-400 border-green-500/20 bg-green-500/5" },
  unreachable: { label: "Unreachable", color: "text-red-400 border-red-500/20 bg-red-500/5" },
  suspicious: { label: "Suspicious", color: "text-orange-400 border-orange-500/20 bg-orange-500/5" },
  no_answer: { label: "No answer", color: "text-zinc-400 border-zinc-500/20 bg-zinc-500/5" },
  cancelled: { label: "Cancelled", color: "text-red-400 border-red-500/20 bg-red-500/5" },
};

const METHOD_LABELS: Record<string, string> = {
  manual_call: "Phone call",
  whatsapp: "WhatsApp",
  sms: "SMS",
};

export default function ConfirmationTimeline({ attempts }: { attempts: ConfirmationAttemptItem[] }) {
  if (attempts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-zinc-500">No contact attempts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attempts.map((attempt, idx) => {
        const meta = OUTCOME_META[attempt.outcome] ?? { label: attempt.outcome, color: "text-zinc-400 border-zinc-500/20 bg-zinc-500/5" };
        const isLatest = idx === 0;
        return (
          <div key={attempt.id} className="relative pl-4 border-l-2 border-zinc-800">
            {isLatest && (
              <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-purple-500" />
            )}
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.color}`}>
                {meta.label}
              </span>
              <span className="text-[10px] text-zinc-600">{METHOD_LABELS[attempt.method] || attempt.method}</span>
              {isLatest && <span className="text-[10px] text-purple-400 font-medium">Latest</span>}
            </div>
            {attempt.notes && (
              <p className="text-xs text-zinc-400 mt-0.5">{attempt.notes}</p>
            )}
            <p className="text-[10px] text-zinc-600 mt-0.5">{attempt.createdAt}</p>
          </div>
        );
      })}
    </div>
  );
}
