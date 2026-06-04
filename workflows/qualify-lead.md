# Workflow: Qualify Lead

## Purpose
Take a user-submitted lead form, run AI qualification via Trigger.dev, and display the structured result in the frontend.

---

## Steps

### 1. User fills form
**File**: `frontend/components/LeadForm.tsx`

Fields to collect:
- Company name
- Industry / sector
- Company size (employee count or band, e.g. "50–200")
- Contact name
- Contact role / job title
- Pain points (what problem they described)
- Budget signals (any budget context mentioned)
- Intent signals (signals of buying intent, urgency, timeline)

On submit: POST the form data as JSON to `/api/qualify`.

---

### 2. API route triggers the task
**File**: `frontend/app/api/qualify/route.ts`

1. Validate the request body matches `LeadPayload` shape
2. Call `tasks.trigger("qualify-lead", payload)` using `TRIGGER_SECRET_KEY` (server-side only)
3. Call `auth.createPublicToken({ scopes: { read: { runs: [handle.id] } }, expirationTime: "1h" })` to mint a short-lived read-only token
4. Return `{ runId: handle.id, publicToken }` as JSON to the browser

---

### 3. Task runs on Trigger.dev
**File**: `trigger/qualify-lead.ts`

1. Zod schema validates the incoming payload automatically (via `schemaTask`)
2. Build a structured prompt for Claude including all lead fields
3. Call `anthropic.messages.create(...)` — not streaming
4. Strip any markdown fences from the response content
5. `JSON.parse` the response into a `QualificationResult`
6. Return the result — Trigger.dev persists it as the run output

---

### 4. Frontend subscribes to the result
**File**: `frontend/components/ResultDisplay.tsx`

1. Receive `runId` and `publicToken` from the API route response
2. Call `useRealtimeRun(runId, { accessToken: publicToken })`
3. Show a loading/spinner state while `run.status` is `QUEUED` or `EXECUTING`
4. When `run.status === "COMPLETED"`, render the `QualificationResult`:
   - Score badge (1–10) with tier colour (Hot = red, Warm = amber, Cold = blue)
   - Four assessment sections: Company Fit, Contact Authority, Pain Alignment, Intent Strength
   - Recommendation paragraph

---

## Error Handling

| Scenario | Handling |
|----------|---------|
| Task fails (Claude error, parse error) | Trigger.dev retries per task config; frontend shows error state when `run.status === "FAILED"` |
| JSON parse failure inside task | Throw the error — Trigger.dev retries the task automatically |
| API route error (bad payload, auth) | Return HTTP 400/500; frontend shows an inline error message with a retry button |
| Realtime timeout | `useRealtimeRun` fires `onComplete` with an error; show a "refresh" prompt |

---

## Data Contract

`QualificationResult` is the shared type between `trigger/qualify-lead.ts` (producer) and `frontend/` (consumer). Any change to this type requires updating both sides in the same PR.

```typescript
type QualificationResult = {
  score: number;            // 1–10
  tier: "Hot" | "Warm" | "Cold";
  companyFit: string;
  contactAuthority: string;
  painAlignment: string;
  intentStrength: string;
  recommendation: string;
};
```

Keep this type in `frontend/lib/types.ts` and import it in both apps (or duplicate deliberately if keeping packages independent).
