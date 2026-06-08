import type { SupabaseClient } from "@supabase/supabase-js";

export async function getTodayUsageCount(
  userId: string,
  supabase: SupabaseClient
): Promise<number> {
  const now = new Date();
  const midnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  const { count, error } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", midnight.toISOString());

  if (error) return 0;
  return count ?? 0;
}

export function isPaidUser(
  profile: { subscription_status?: string | null } | null | undefined
): boolean {
  const status = profile?.subscription_status;
  return status === "active" || status === "trialing";
}

export async function getProfile(userId: string, supabase: SupabaseClient) {
  const { data } = await supabase
    .from("profiles")
    .select(
      "stripe_customer_id, stripe_subscription_id, subscription_status, subscription_period_end"
    )
    .eq("id", userId)
    .single();
  return data;
}
