import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (serviceClient.from("profiles") as any)
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

  const freeFeatures = [
    "2 lead qualifications per day",
    "AI-powered scoring",
    "5-category breakdown",
    "Lead history",
  ];

  const proFeatures = [
    "Unlimited qualifications",
    "AI-powered scoring",
    "5-category breakdown",
    "Lead history",
    "Priority processing",
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-6 py-10 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-body bg-surface border border-border px-3.5 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors mb-10"
        >
          ← Back
        </Link>

        <div className="text-center mb-10">
          <h1 className="font-display text-5xl sm:text-6xl text-primary mb-3">
            Pricing
          </h1>
          <p className="text-sm text-body">
            Start free with 2 qualifications per day. Upgrade for unlimited
            access.
          </p>
        </div>

        {isPaid && (
          <div className="bg-accent/15 border border-accent/50 rounded-xl px-5 py-3.5 mb-8 text-center">
            <p className="text-sm font-medium text-primary">
              Subscription activated! You now have unlimited qualifications.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* Free card */}
          <div className="bg-surface border border-border rounded-2xl p-7 flex flex-col">
            <p className="font-display text-2xl text-primary mb-2">Free</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display text-4xl text-primary">$0</span>
              <span className="text-sm text-muted">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-body">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                    <path
                      d="M2 7l3.5 3.5L12 3.5"
                      stroke="#8EA098"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full text-sm font-semibold text-muted border border-border rounded-lg py-2.5 cursor-default"
            >
              Free Tier
            </button>
          </div>

          {/* Pro card */}
          <div
            className={`bg-surface border rounded-2xl p-7 flex flex-col relative ${
              isPaid ? "border-primary" : "border-border"
            }`}
          >
            {isPaid && (
              <span className="absolute -top-3.5 left-5 bg-primary text-accent text-xs font-semibold px-3 py-1 rounded-full">
                Current Plan
              </span>
            )}
            <p className="font-display text-2xl text-primary mb-2">Pro</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display text-4xl text-primary">$29</span>
              <span className="text-sm text-muted">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-body">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                    <path
                      d="M2 7l3.5 3.5L12 3.5"
                      stroke="#1B3A2D"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {isPaid && periodEnd && (
              <p className="text-xs text-muted mb-3">Renews {periodEnd}</p>
            )}
            {isPaid ? (
              <a
                href="/api/stripe/portal"
                className="w-full text-center block bg-primary text-accent text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Manage Subscription
              </a>
            ) : (
              <a
                href="/api/stripe/checkout"
                className="w-full text-center block bg-primary text-accent text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Upgrade to Pro →
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
