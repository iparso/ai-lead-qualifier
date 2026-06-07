import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { LeadDetail } from "@/lib/types";

const TIER_CONFIG = {
  Hot: { bg: "bg-hot-muted", border: "border-hot/20", text: "text-hot", dot: "bg-hot", label: "Hot Lead" },
  Warm: { bg: "bg-warm-muted", border: "border-warm/20", text: "text-warm", dot: "bg-warm", label: "Warm Lead" },
  Cold: { bg: "bg-cold-muted", border: "border-cold/20", text: "text-cold", dot: "bg-cold", label: "Cold Lead" },
} as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) notFound();

  const lead = data as LeadDetail;
  const isPending = !lead.completed_at;
  const tier = lead.tier ? TIER_CONFIG[lead.tier] : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-6 py-14 pb-24">
        {/* Back link */}
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors mb-8"
        >
          ← Back to history
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium text-body">
              {formatDate(lead.created_at)}
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-primary leading-tight mb-2">
            {lead.company_name}
          </h1>
          <p className="text-body text-base mt-2">
            {lead.contact_name} · {lead.contact_role}
          </p>
        </div>

        {isPending ? (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-9 h-9 rounded-full border-2 border-border border-t-primary animate-spin" />
            </div>
            <p className="text-sm font-semibold text-primary mb-1">Analysing…</p>
            <p className="text-xs text-muted">This lead is still being evaluated.</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Score hero */}
            {tier && (
              <div className={`bg-surface rounded-2xl border ${tier.border} ${tier.bg} p-8`}>
                <div className="flex items-start justify-between flex-wrap gap-6">
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
                      Qualification Score
                    </p>
                    <div className="flex items-end gap-2">
                      <span className={`font-display text-8xl leading-none ${tier.text}`}>
                        {lead.score}
                      </span>
                      <span className="text-muted text-xl mb-2">/10</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
                      Lead Tier
                    </p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${tier.border} bg-surface`}>
                      <span className={`w-2 h-2 rounded-full ${tier.dot}`} />
                      <span className={`text-sm font-semibold ${tier.text}`}>{tier.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assessment grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Company Fit", value: lead.company_fit },
                { label: "Contact Authority", value: lead.contact_authority },
                { label: "Pain Alignment", value: lead.pain_alignment },
                { label: "Intent Strength", value: lead.intent_strength },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label} className="bg-surface rounded-2xl border border-border p-6">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                      {label}
                    </p>
                    <p className="text-sm leading-relaxed text-body">{value}</p>
                  </div>
                ) : null
              )}
            </div>

            {/* Recommendation */}
            {lead.recommendation && (
              <div className="bg-surface rounded-2xl border border-border p-6">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                  Recommendation
                </p>
                <p className="text-sm leading-relaxed text-body">{lead.recommendation}</p>
              </div>
            )}

            {/* Lead inputs */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-5">
                Lead Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Industry", value: lead.industry },
                  { label: "Company Size", value: lead.company_size },
                  { label: "Pain Points", value: lead.pain_points },
                  { label: "Budget Signals", value: lead.budget_signals },
                  { label: "Intent Signals", value: lead.intent_signals },
                  { label: "Current Solution", value: lead.current_solution },
                ]
                  .filter(({ value }) => value)
                  .map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-muted mb-1">{label}</p>
                      <p className="text-sm text-body">{value}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
