import { createClient } from "@/lib/supabase/server";
import { getTodayUsageCount } from "@/lib/subscription";
import HomeClient from "@/components/HomeClient";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <HomeClient
        subscriptionStatus="free"
        usageCount={0}
        checkoutSuccess={false}
      />
    );
  }

  const [profileResult, usageCount] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single(),
    getTodayUsageCount(user.id, supabase),
  ]);

  const subscriptionStatus =
    profileResult.data?.subscription_status ?? "free";

  return (
    <HomeClient
      subscriptionStatus={subscriptionStatus}
      usageCount={usageCount}
      checkoutSuccess={checkout === "success"}
    />
  );
}
