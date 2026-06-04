"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { QualificationResult } from "@/lib/types";

type Props = {
  runId: string;
  publicToken: string;
  onReset: () => void;
};

const TIER_CONFIG = {
  Hot: {
    bg: "bg-hot-muted",
    border: "border-hot/20",
    text: "text-hot",
    dot: "bg-hot",
    label: "Hot Lead",
  },
  Warm: {
    bg: "bg-warm-muted",
    border: "border-warm/20",
    text: "text-warm",
    dot: "bg-warm",
    label: "Warm Lead",
  },
  Cold: {
    bg: "bg-cold-muted",
    border: "border-cold/20",
    text: "text-cold",
    dot: "bg-cold",
    label: "Cold Lead",
  },
} as const;

export default function ResultDisplay({ runId, publicToken, onReset }: Props) {
  const { run, error } = useRealtimeRun(runId, { accessToken: publicToken });

  if (error) {
    return (
      <Card>
        <div className="text-center py-10 space-y-3">
          <p className="text-xs font-semibold text-hot uppercase tracking-wide">
            Connection Error
          </p>
          <p className="text-sm text-body">{error.message}</p>
          <ResetButton onClick={onReset} />
        </div>
      </Card>
    );
  }

  const status = run?.status;

  const isInProgress =
    !run ||
    status === "QUEUED" ||
    status === "DEQUEUED" ||
    status === "EXECUTING" ||
    status === "WAITING" ||
    status === "PENDING_VERSION" ||
    status === "DELAYED";

  if (isInProgress) {
    return (
      <Card>
        <div className="text-center py-14 space-y-5">
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-full border-2 border-border border-t-primary animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary mb-1">
              {status === "QUEUED" || status === "DEQUEUED"
                ? "Queued"
                : "Analysing…"}
            </p>
            <p className="text-xs text-muted">Evaluating this lead</p>
          </div>
        </div>
      </Card>
    );
  }

  if (
    status === "FAILED" ||
    status === "CRASHED" ||
    status === "SYSTEM_FAILURE" ||
    status === "TIMED_OUT" ||
    status === "CANCELED" ||
    status === "EXPIRED"
  ) {
    return (
      <Card>
        <div className="text-center py-10 space-y-3">
          <p className="text-xs font-semibold text-hot uppercase tracking-wide">
            Analysis Failed
          </p>
          <p className="text-sm text-body">
            The qualification could not complete. Please try again.
          </p>
          <ResetButton onClick={onReset} />
        </div>
      </Card>
    );
  }

  if (status !== "COMPLETED" || !run.output) {
    return (
      <Card>
        <div className="text-center py-10">
          <p className="text-sm text-muted">Waiting for results…</p>
        </div>
      </Card>
    );
  }

  const result = run.output as QualificationResult;
  const tier = TIER_CONFIG[result.tier];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Score Hero */}
      <div
        className={`bg-surface rounded-2xl border ${tier.border} ${tier.bg} p-8`}
      >
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
              Qualification Score
            </p>
            <div className="flex items-end gap-2">
              <span
                className={`font-display text-8xl leading-none ${tier.text}`}
              >
                {result.score}
              </span>
              <span className="text-muted text-xl mb-2">/10</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
              Lead Tier
            </p>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${tier.border} bg-surface`}
            >
              <span className={`w-2 h-2 rounded-full ${tier.dot}`} />
              <span className={`text-sm font-semibold ${tier.text}`}>
                {tier.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Company Fit", value: result.companyFit, index: 1 },
          { label: "Contact Authority", value: result.contactAuthority, index: 2 },
          { label: "Pain Alignment", value: result.painAlignment, index: 3 },
          { label: "Intent Strength", value: result.intentStrength, index: 4 },
        ].map(({ label, value, index }) => (
          <div
            key={label}
            className="bg-surface rounded-2xl border border-border p-6 animate-slide-up"
            style={{
              animationDelay: `${index * 80}ms`,
              animationFillMode: "both",
            }}
          >
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
              {label}
            </p>
            <p className="text-sm leading-relaxed text-body">{value}</p>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
          Recommendation
        </p>
        <p className="text-sm leading-relaxed text-body">{result.recommendation}</p>
      </div>

      {/* Reset */}
      <div className="flex justify-center pt-4">
        <ResetButton onClick={onReset} />
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-2xl border border-border">{children}</div>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-surface border border-border text-body text-sm font-medium px-6 py-2.5 rounded-lg hover:border-primary hover:text-primary transition-colors"
    >
      Analyse Another Lead
    </button>
  );
}
