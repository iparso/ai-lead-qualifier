import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const LeadPayloadSchema = z.object({
  companyName: z.string(),
  industry: z.string(),
  companySize: z.string(),
  contactName: z.string(),
  contactRole: z.string(),
  painPoints: z.string(),
  budgetSignals: z.string(),
  intentSignals: z.string(),
  currentSolution: z.string().optional(),
});

const QualificationResultSchema = z.object({
  score: z.number().min(1).max(10),
  tier: z.enum(["Hot", "Warm", "Cold"]),
  companyFit: z.string(),
  contactAuthority: z.string(),
  painAlignment: z.string(),
  intentStrength: z.string(),
  recommendation: z.string(),
});

export type LeadPayload = z.infer<typeof LeadPayloadSchema>;
export type QualificationResult = z.infer<typeof QualificationResultSchema>;

export const qualifyLead = schemaTask({
  id: "qualify-lead",
  schema: LeadPayloadSchema,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2,
  },
  run: async (payload) => {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    logger.info("Qualifying lead", { companyName: payload.companyName });

    const prompt = `You are an expert sales qualification analyst. Analyse the following lead and return a structured qualification assessment.

Lead Information:
- Company: ${payload.companyName}
- Industry: ${payload.industry}
- Company Size: ${payload.companySize}
- Contact Name: ${payload.contactName}
- Contact Role: ${payload.contactRole}
- Pain Points: ${payload.painPoints}
- Budget Signals: ${payload.budgetSignals}
- Intent Signals: ${payload.intentSignals}${payload.currentSolution ? `\n- Current Solution: ${payload.currentSolution}` : ""}

Evaluate this lead across four dimensions:
1. Company Fit: Does the company profile (industry, size) match a strong customer profile?
2. Contact Authority: Is this contact a decision maker, influencer, or end user?
3. Pain Alignment: How strongly do their pain points align with a solution you could provide?
4. Buying Intent: How strong are the signals that they are ready to buy?

Return ONLY valid JSON with no markdown, no explanation, and no extra text — just the raw JSON object:

{
  "score": <number 1-10>,
  "tier": <"Hot" | "Warm" | "Cold">,
  "companyFit": "<1-2 sentence assessment>",
  "contactAuthority": "<1-2 sentence assessment>",
  "painAlignment": "<1-2 sentence assessment>",
  "intentStrength": "<1-2 sentence assessment>",
  "recommendation": "<2-3 sentence overall recommendation and suggested next step>"
}

Scoring guide:
- Hot (8–10): Strong fit, decision maker, clear pain, high intent — prioritise immediately
- Warm (5–7): Good potential but missing one or two key signals — nurture
- Cold (1–4): Poor fit, low authority, or low intent — deprioritise`;

    let rawContent: string;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      rawContent = response.content[0].type === "text" ? response.content[0].text : "";
    } catch (error) {
      logger.error("Anthropic API call failed", { error });
      throw error;
    }

    // Strip markdown fences if Claude wraps the response anyway
    const cleaned = rawContent
      .replace(/^```(?:json)?\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      logger.error("Failed to parse Claude response as JSON", { rawContent });
      throw new Error(`Claude returned non-JSON response: ${rawContent.slice(0, 200)}`);
    }

    const result = QualificationResultSchema.parse(parsed);

    logger.info("Lead qualified", {
      companyName: payload.companyName,
      score: result.score,
      tier: result.tier,
    });

    return result;
  },
});
