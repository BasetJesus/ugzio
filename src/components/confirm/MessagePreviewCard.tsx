"use client";

import type { PsychologyPreview } from "@/types/whatsapp";

const TONE_LABELS: Record<string, string> = {
  calm: "Calm & human",
  operational: "Operational reminder",
  soft_urgency: "Soft urgency",
  reassuring: "Reassuring",
};

const TONE_COLORS: Record<string, string> = {
  calm: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  operational: "text-[var(--warning-amber)] bg-[var(--warning-amber-bg)] border-[var(--warning-amber-border)]",
  soft_urgency: "text-[var(--risk-red)] bg-[var(--kpi-red-bg)] border-[var(--kpi-red-border)]",
  reassuring: "text-[var(--success-green)] bg-[var(--success-green-bg)] border-[var(--success-green-border)]",
};

const SEQUENCE_LABELS: Record<string, string> = {
  trust: "Trust Sequence",
  reminder: "Reminder Sequence",
  urgency: "Urgency Sequence",
  reassurance: "Reassurance Sequence",
};

interface Props {
  preview: PsychologyPreview;
}

export default function MessagePreviewCard({ preview }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Psychology Insight
          </span>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${TONE_COLORS[preview.tone] ?? ""}`}>
          {TONE_LABELS[preview.tone] ?? preview.tone}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
              Sequence
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)]">
              {SEQUENCE_LABELS[preview.sequenceType] ?? preview.sequenceType}
            </span>
          </div>

          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] p-3">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              &ldquo;{preview.previewMessage}&rdquo;
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] p-3">
            <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
              Why this sequence
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {preview.psychologicalReason}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] p-3">
            <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
              Expected goal
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {preview.expectedGoal}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
