export type LeadPayload = {
  companyName: string;
  industry: string;
  companySize: string;
  contactName: string;
  contactRole: string;
  painPoints: string;
  budgetSignals: string;
  intentSignals: string;
  currentSolution?: string;
};

export type QualificationResult = {
  score: number;
  tier: "Hot" | "Warm" | "Cold";
  companyFit: string;
  contactAuthority: string;
  painAlignment: string;
  intentStrength: string;
  recommendation: string;
};

export type LeadRecord = {
  id: string;
  company_name: string;
  contact_name: string;
  tier: "Hot" | "Warm" | "Cold" | null;
  score: number | null;
  created_at: string;
  completed_at: string | null;
};

export type LeadDetail = {
  id: string;
  company_name: string;
  industry: string;
  company_size: string;
  contact_name: string;
  contact_role: string;
  pain_points: string;
  budget_signals: string | null;
  intent_signals: string | null;
  current_solution: string | null;
  tier: "Hot" | "Warm" | "Cold" | null;
  score: number | null;
  company_fit: string | null;
  contact_authority: string | null;
  pain_alignment: string | null;
  intent_strength: string | null;
  recommendation: string | null;
  created_at: string;
  completed_at: string | null;
};
