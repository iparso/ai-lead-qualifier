import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_period_end")
    .eq("id", user.id)
    .single();

  const status = profile?.subscription_status ?? "free";
  const isPaid = status === "active" || status === "trialing";
  const periodEnd = profile?.subscription_period_end
    ? new Date(profile.subscription_period_end).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-6 py-14 pb-24">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium text-body">Billing</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-primary leading-tight mb-4">
            Your plan.
          </h1>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 max-w-md">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
            Current Plan
          </p>
          <p className="font-display text-4xl text-primary mb-2">
            {isPaid ? "Pro" : "Free"}
          </p>

          {isPaid ? (
            <>
              <p className="text-sm text-body mb-1">
                Unlimited lead qualifications
              </p>
              {periodEnd && (
                <p className="text-xs text-muted mb-6">Renews {periodEnd}</p>
              )}
              <a
                href="/api/stripe/portal"
                className="inline-flex items-center gap-2 bg-surface border border-border text-body font-semibold text-sm px-6 py-2.5 rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                Manage Subscription →
              </a>
            </>
          ) : (
            <>
              <p className="text-sm text-body mb-1">
                2 lead qualifications per day
              </p>
              <p className="text-xs text-muted mb-6">Resets at midnight UTC</p>
              <a
                href="/api/stripe/checkout"
                className="inline-flex items-center gap-2 bg-primary text-accent font-semibold text-sm px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Upgrade to Pro — $29/month →
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
