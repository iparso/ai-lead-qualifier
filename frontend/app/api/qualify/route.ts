import { NextRequest, NextResponse } from "next/server";
import { tasks, auth } from "@trigger.dev/sdk";
import type { LeadPayload } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

const REQUIRED_FIELDS: (keyof LeadPayload)[] = [
  "companyName",
  "industry",
  "companySize",
  "contactName",
  "contactRole",
  "painPoints",
];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  for (const field of REQUIRED_FIELDS) {
    if (
      typeof payload[field] !== "string" ||
      !(payload[field] as string).trim()
    ) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  const leadPayload = payload as LeadPayload;

  const { data: lead, error: dbError } = await supabase
    .from("leads")
    .insert({
      user_id: user.id,
      company_name: leadPayload.companyName,
      industry: leadPayload.industry,
      company_size: leadPayload.companySize,
      contact_name: leadPayload.contactName,
      contact_role: leadPayload.contactRole,
      pain_points: leadPayload.painPoints,
      budget_signals: leadPayload.budgetSignals || null,
      intent_signals: leadPayload.intentSignals || null,
      current_solution: leadPayload.currentSolution || null,
    })
    .select("id")
    .single();

  if (dbError || !lead) {
    console.error("Failed to save lead:", dbError);
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 }
    );
  }

  try {
    const handle = await tasks.trigger("qualify-lead", leadPayload);
    const publicToken = await auth.createPublicToken({
      scopes: { read: { runs: [handle.id] } },
      expirationTime: "1h",
    });

    await supabase
      .from("leads")
      .update({ run_id: handle.id })
      .eq("id", lead.id);

    return NextResponse.json({
      runId: handle.id,
      publicToken,
      leadId: lead.id,
    });
  } catch (err) {
    console.error("Failed to trigger qualify-lead:", err);
    return NextResponse.json(
      { error: "Failed to start analysis" },
      { status: 500 }
    );
  }
}
