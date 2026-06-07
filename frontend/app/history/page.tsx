import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { LeadRecord } from "@/lib/types";

const TIER_STYLE: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  Hot: { bg: "bg-hot-muted border-hot/20", text: "text-hot", dot: "bg-hot", label: "Hot" },
  Warm: { bg: "bg-warm-muted border-warm/20", text: "text-warm", dot: "bg-warm", label: "Warm" },
  Cold: { bg: "bg-cold-muted border-cold/20", text: "text-cold", dot: "bg-cold", label: "Cold" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select(
      "id, company_name, contact_name, tier, score, created_at, completed_at"
    )
    .order("created_at", { ascending: false });

  const rows = (leads ?? []) as LeadRecord[];

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-6 py-14 pb-24">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium text-body">Lead History</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-primary leading-tight mb-4">
            Your qualifications.
          </h1>
          <p className="text-body text-base leading-relaxed max-w-md mt-4">
            Every lead you&apos;ve run through the qualifier, with their scores
            and tiers.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center animate-fade-in">
            <p className="text-body text-sm mb-4">No leads qualified yet.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-accent font-semibold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Qualify your first lead →
            </Link>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {rows.map((lead) => {
              const tier = lead.tier ? TIER_STYLE[lead.tier] : null;
              const isPending = !lead.completed_at;

              return (
                <div
                  key={lead.id}
                  className="bg-surface rounded-2xl border border-border px-6 py-5 flex items-center gap-5 flex-wrap"
                >
                  {/* Company + contact */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate">
                      {lead.company_name}
                    </p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {lead.contact_name}
                    </p>
                  </div>

                  {/* Tier badge */}
                  <div className="shrink-0">
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted bg-surface-secondary border border-border rounded-full px-3 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" />
                        Analysing…
                      </span>
                    ) : tier ? (
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 ${tier.bg} ${tier.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
                        {tier.label}
                      </span>
                    ) : null}
                  </div>

                  {/* Score */}
                  <div className="shrink-0 text-right w-16">
                    {isPending ? (
                      <span className="text-xs text-muted">—</span>
                    ) : (
                      <>
                        <span
                          className={`text-2xl font-display leading-none ${tier ? tier.text : "text-primary"}`}
                        >
                          {lead.score}
                        </span>
                        <span className="text-xs text-muted">/10</span>
                      </>
                    )}
                  </div>

                  {/* Date */}
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted">
                      {formatDate(lead.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
