import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "not logged in" });

  const serviceClient = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error } = await (serviceClient.from("profiles") as any)
    .select("id, subscription_status, stripe_customer_id, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    profile,
    error: error?.message ?? null,
  });
}
