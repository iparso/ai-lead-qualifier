"use client";

import { useState } from "react";
import LeadForm from "@/components/LeadForm";
import ResultDisplay from "@/components/ResultDisplay";

type Phase =
  | { name: "idle" }
  | { name: "loading" }
  | { name: "result"; runId: string; publicToken: string; leadId: string }
  | { name: "error"; message: string };

export default function Home() {
  const [phase, setPhase] = useState<Phase>({ name: "idle" });

  function handleResult(runId: string, publicToken: string, leadId: string) {
    setPhase({ name: "result", runId, publicToken, leadId });
  }

  function handleError(message: string) {
    setPhase({ name: "error", message });
  }

  function reset() {
    setPhase({ name: "idle" });
  }

  const isFormPhase =
    phase.name === "idle" || phase.name === "loading" || phase.name === "error";

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-6 py-14 pb-24">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium text-body">Qualification Engine</span>
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
