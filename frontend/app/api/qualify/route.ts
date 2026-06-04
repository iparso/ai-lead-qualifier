import { NextRequest, NextResponse } from "next/server";
import { tasks, auth } from "@trigger.dev/sdk";
import type { LeadPayload } from "@/lib/types";

const REQUIRED_FIELDS: (keyof LeadPayload)[] = [
  "companyName",
  "industry",
  "companySize",
  "contactName",
  "contactRole",
  "painPoints",
];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  for (const field of REQUIRED_FIELDS) {
    if (typeof payload[field] !== "string" || !(payload[field] as string).trim()) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  try {
    const handle = await tasks.trigger("qualify-lead", payload as LeadPayload);
    const publicToken = await auth.createPublicToken({
      scopes: { read: { runs: [handle.id] } },
      expirationTime: "1h",
    });
    return NextResponse.json({ runId: handle.id, publicToken });
  } catch (err) {
    console.error("Failed to trigger qualify-lead:", err);
    return NextResponse.json({ error: "Failed to start analysis" }, { status: 500 });
  }
}
