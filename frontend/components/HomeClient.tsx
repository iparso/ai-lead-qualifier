"use client";

import { useState } from "react";
import LeadForm from "@/components/LeadForm";
import ResultDisplay from "@/components/ResultDisplay";
import UsageBanner from "@/components/UsageBanner";

type Phase =
  | { name: "idle" }
  | { name: "loading" }
  | { name: "result"; runId: string; publicToken: string; leadId: string }
  | { name: "error"; message: string }
  | { name: "paywall" };

type Props = {
  subscriptionStatus: string;
  usageCount: number;
  checkoutSuccess: boolean;
};

export default function HomeClient({
  subscriptionStatus,
  usageCount,
  checkoutSuccess,
}: Props) {
  const [phase, setPhase] = useState<Phase>({ name: "idle" });

  const isPaid =
    subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const limitReached = !isPaid && usageCount >= 2;

  function handleResult(runId: string, publicToken: string, leadId: string) {
    setPhase({ name: "result", runId, publicToken, leadId });
  }

  function handleError(message: string) {
    if (message === "limit_reached") {
      setPhase({ name: "paywall" });
    } else {
      setPhase({ name: "error", message });
    }
  }

  function reset() {
    setPhase({ name: "idle" });
  }

  const showPaywall = limitReached || phase.name === "paywall";
  const isFormPhase =
    !showPaywall &&
    (phase.name === "idle" || phase.name === "loading" || phase.name === "error");

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-6 py-14 pb-24">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium text-body">
              Qualification Engine
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-primary leading-tight mb-4">
            Qualify a lead,{" "}
            <span className="relative inline-block">
              instantly.
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-accent rounded-full" />
            </span>
          </h1>
          <p className="text-body text-base leading-relaxed max-w-md mt-4">
            Enter what you know about the prospect. We&apos;ll analyse company
            fit, contact authority, pain alignment, and buying intent — and
            return a structured score.
          </p>
        </div>

        {/* Checkout success banner */}
        {checkoutSuccess && (
          <div className="mb-8 bg-accent/10 border border-accent/30 rounded-xl px-5 py-4 animate-fade-in">
            <p className="text-sm font-semibold text-primary">
              You&apos;re now on Pro — unlimited analyses unlocked.
            </p>
          </div>
        )}

        {/* Usage banner (free users only) */}
        {phase.name !== "result" && (
          <UsageBanner
            subscriptionStatus={subscriptionStatus}
            usageCount={usageCount}
          />
        )}

        {/* Error banner */}
        {phase.name === "error" && (
          <div className="mb-8 bg-hot-muted border border-hot/20 rounded-xl px-5 py-4 flex items-start justify-between gap-4 animate-fade-in">
            <div>
              <p className="text-xs font-semibold text-hot uppercase tracking-wide mb-1">
                Error
              </p>
              <p className="text-sm text-body">{phase.message}</p>
            </div>
            <button
              onClick={reset}
              className="text-xs text-muted hover:text-primary shrink-0 pt-0.5 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Paywall */}
        {showPaywall && (
          <div className="bg-surface rounded-2xl border border-border p-10 text-center animate-fade-in">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Free Limit Reached
            </p>
            <h2 className="font-display text-3xl text-primary mb-3">
              You&apos;ve used your 2 free analyses today.
            </h2>
            <p className="text-sm text-body mb-8 max-w-sm mx-auto">
              Upgrade to Pro for unlimited lead qualifications at $29/month.
              Resets daily at midnight UTC on the free plan.
            </p>
            <a
              href="/api/stripe/checkout"
              className="inline-flex items-center gap-2 bg-primary text-accent font-semibold text-sm px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Upgrade to Pro →
            </a>
          </div>
        )}

        {/* Form or Results */}
        {isFormPhase ? (
          <div className="animate-fade-in">
            <LeadForm
              onResult={(runId, token, leadId) => {
                setPhase({ name: "loading" });
                handleResult(runId, token, leadId);
              }}
              onError={handleError}
              disabled={phase.name === "loading"}
            />
          </div>
        ) : phase.name === "result" ? (
          <ResultDisplay
            runId={phase.runId}
            publicToken={phase.publicToken}
            leadId={phase.leadId}
            onReset={reset}
          />
        ) : null}
      </main>
    </div>
  );
}
