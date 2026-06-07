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
