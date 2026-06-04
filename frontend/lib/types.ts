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
