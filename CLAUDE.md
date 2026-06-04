# AI Lead Qualifier

An AI-powered lead qualification tool. A user fills out a form about a prospect, clicks "Analyse", and a Trigger.dev workflow runs AI qualification logic and returns a structured result to the frontend.

---

## The WAT Framework

This project is organised around the WAT framework.

| Letter | Layer | What it is |
|--------|-------|------------|
| **W** | **Workflows** (`/workflows/`) | Step-by-step procedure files (.md) that describe what each workflow does, in what order, and which decisions are made at each step. |
| **A** | **Agent** | Claude Code — the AI assistant that reads this file, interprets workflows, and implements code changes across both apps. No folder needed. |
| **T** | **Tools** (`/tools/`) | Helper scripts for development tasks: deploying, testing, seeding data, and invoking the Trigger.dev API manually. |

---

## Folder Structure

```
/                                ← Monorepo root (one GitHub repo)
├── CLAUDE.md                    ← Read at the start of every session
├── frontend/                    ← Next.js app (deployed to Vercel)
│   ├── app/                     ← App Router: pages, layouts, API routes
│   │   └── api/qualify/route.ts ← Server-side route that triggers the task
│   ├── components/              ← React components (form, results card, UI)
│   └── lib/                     ← Client utilities, shared types
├── trigger/                     ← Trigger.dev tasks (AI backend)
│   ├── qualify-lead.ts          ← Main qualification task
│   └── trigger.config.ts        ← Trigger.dev project config
├── workflows/                   ← W: procedure files
│   └── qualify-lead.md          ← End-to-end qualification workflow
└── tools/                       ← T: helper scripts
    └── trigger-test.ts          ← Manually fire the task with a sample payload
```

Each app (`frontend/`, `trigger/`) has its own `package.json`.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js (App Router) on Vercel | Form UI + results display |
| Backend / AI | Trigger.dev v4 (`@trigger.dev/sdk`) | Hosts the qualification task |
| AI Model | Claude via `@anthropic-ai/sdk` | Runs inside the Trigger.dev task |
| Deployment | GitHub → Vercel (frontend), Trigger.dev CLI (backend) | Monorepo; Vercel root set to `frontend/` |
| Language | TypeScript throughout | Strict mode, ES2022 target |

### Key Dependencies

**`trigger/package.json`**:
- `@trigger.dev/sdk` — v4 (`task`, `schemaTask`, `logger`, `defineConfig`)
- `@anthropic-ai/sdk` — Anthropic SDK for Claude API calls
- `zod` — payload schema validation

**`frontend/package.json`**:
- `next`, `react`, `react-dom`
- `@trigger.dev/sdk` — used server-side to call `tasks.trigger()`
- `@trigger.dev/react-hooks` — used client-side for Realtime subscriptions

---

## Communication Pattern

```
User fills form
      ↓
Next.js API route  (frontend/app/api/qualify/route.ts)
      ↓  tasks.trigger("qualify-lead", payload)  [server-side, secret key]
Trigger.dev cloud
      ↓  spins up task runner
qualify-lead.ts task
      ↓  calls Anthropic SDK → Claude
      ↓  returns QualificationResult
Frontend subscribes via Trigger.dev Realtime
      ↓  useRealtimeRun(runId, { accessToken })
Results displayed in UI
```

The API route returns the `runId` + a short-lived public access token to the browser. The browser uses `useRealtimeRun` to subscribe to that run and receive the output when the task completes — no polling loop needed.

---

## Lead Qualification Task

**File**: `trigger/qualify-lead.ts`

### Input (`LeadPayload`)

| Field | Type | Description |
|-------|------|-------------|
| `companyName` | string | Name of the prospect company |
| `industry` | string | Industry/sector |
| `companySize` | string | Employee count or band (e.g. "50–200") |
| `contactName` | string | Lead's full name |
| `contactRole` | string | Job title |
| `painPoints` | string | Problem they described |
| `budgetSignals` | string | Any budget context mentioned |
| `intentSignals` | string | Signals of buying intent |

### What Claude evaluates

1. **Company fit** — industry alignment, size, and budget signals vs. ideal customer profile
2. **Contact authority** — decision maker, influencer, or end user?
3. **Pain point alignment** — how closely pain points match what the product solves
4. **Buying intent** — urgency, timeline, and explicit interest signals
5. **Overall score + recommendation** — Hot / Warm / Cold with a 1–10 score and a 2–3 sentence rationale

### Output (`QualificationResult`)

```typescript
{
  score: number;            // 1–10
  tier: "Hot" | "Warm" | "Cold";
  companyFit: string;       // 1–2 sentence assessment
  contactAuthority: string; // 1–2 sentence assessment
  painAlignment: string;    // 1–2 sentence assessment
  intentStrength: string;   // 1–2 sentence assessment
  recommendation: string;   // 2–3 sentence overall recommendation
}
```

### Task skeleton

```typescript
import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const LeadPayloadSchema = z.object({ ... });

export const qualifyLead = schemaTask({
  id: "qualify-lead",
  schema: LeadPayloadSchema,
  run: async (payload) => {
    // 1. Build prompt
    // 2. Call Claude (anthropic.messages.create)
    // 3. Parse JSON from response
    // 4. Return QualificationResult
  },
});
```

---

## Key Conventions

### Trigger.dev v4
- Import from `@trigger.dev/sdk` — never from `@trigger.dev/sdk/v3`
- Use `schemaTask` for tasks with structured payloads (with Zod schema)
- Use `task` for simple tasks without schema validation
- **Never use `client.defineJob`** — that is deprecated v2/v3 syntax
- Task IDs are kebab-case: `"qualify-lead"`
- `trigger.config.ts` uses `defineConfig` from `@trigger.dev/sdk`
- Dev: `npx trigger.dev@latest dev` (inside `trigger/`)
- Deploy: `npx trigger.dev@latest deploy` (inside `trigger/`)

### TypeScript
- Strict mode everywhere
- Infer types from Zod schemas: `type LeadPayload = z.infer<typeof LeadPayloadSchema>`
- All files are `.ts`

### Claude API (inside Trigger.dev task)
- Default model: `claude-sonnet-4-6`
- `new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })`
- Use `anthropic.messages.create(...)` — not streaming
- Instruct Claude to respond with JSON only; strip any markdown fences before `JSON.parse`
- Wrap Claude calls in try/catch; use `logger.error` on failure

### Frontend conventions
- App Router only (no Pages Router)
- API route at `app/api/qualify/route.ts` is server-side; uses `TRIGGER_SECRET_KEY`
- Never expose `TRIGGER_SECRET_KEY` to the browser
- Use `auth.createPublicToken` server-side to mint a short-lived read-only token, then pass it to the client for `useRealtimeRun`

### Logging inside Trigger.dev tasks
- Use `logger.info`, `logger.debug`, `logger.error` from `@trigger.dev/sdk`
- Not `console.log`

---

## Environment Variables

| Variable | App | Description |
|----------|-----|-------------|
| `ANTHROPIC_API_KEY` | `trigger/` | Anthropic API key |
| `TRIGGER_SECRET_KEY` | `frontend/` (server-side only) | Trigger.dev secret key for triggering tasks |
| `NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY` | `frontend/` (client-side) | Trigger.dev public key for Realtime subscriptions |

Set these in:
- **Trigger.dev**: dashboard → Project → Environment Variables
- **Vercel**: dashboard → Project → Environment Variables
- **Local dev**: `.env.local` in `frontend/`, `.env` in `trigger/`

---

## Workflows (`/workflows/`)

Each file is a `.md` procedure named as `verb-noun.md`. Claude Code reads the relevant workflow before implementing a multi-step change.

| File | Purpose |
|------|---------|
| `qualify-lead.md` | End-to-end: form → task trigger → Realtime → result display |
| `add-field.md` | Add a new input field to both the form and the task schema |
| `deploy.md` | Deploy checklist for frontend (Vercel) and backend (Trigger.dev) |

---

## Tools (`/tools/`)

One-thing-at-a-time helper scripts.

| File | Purpose |
|------|---------|
| `trigger-test.ts` | Manually trigger `qualify-lead` with a sample payload and print result |
| `deploy-trigger.sh` | Thin wrapper around `npx trigger.dev@latest deploy` with env var checks |

---

## Agent Instructions

When working on this project:

1. **Read the relevant workflow first** before implementing any multi-step change
2. **Know which app is affected** — form changes → `frontend/`, AI logic changes → `trigger/`
3. **Never use `client.defineJob`** — Trigger.dev v4 uses `task` or `schemaTask`
4. **Treat `QualificationResult` as the contract** between backend and frontend — changing it requires updating both sides simultaneously
5. **All Claude API calls go inside the Trigger.dev task** — the frontend never calls Anthropic directly
6. **Use `logger.*` not `console.log`** inside Trigger.dev tasks
7. **Test locally** with `npx trigger.dev@latest dev` before deploying
8. **Each app has its own `package.json`** — install deps in the correct folder
