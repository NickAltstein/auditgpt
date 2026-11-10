export type ASTIVerdict =
  | 'AuditGPT Certified Trusted'
  | 'Verified with Conditions'
  | 'Speculative / Use at Your Own Risk'
  | 'High Failure Probability'
  | 'Verified Shovelware / Do Not Deploy';

export type AuditTier = 'tier1_flash' | 'tier2_full' | 'tier3_monitoring';

export interface CircuitBreakerStatus {
  tripped: boolean;
  reason?: string;
  hardCapApplied: boolean;
  rawScore: number;
  finalScore: number;
}

export interface ERISubMetrics {
  tcr: number; // Task Completion Rate (40%)
  hds: number; // Hallucination & Drift Score (30%)
  rr: number;  // Recovery Rate with 0/0 edge-case fix (15%)
  cs: number;  // Consistency Score (15%)
}

export interface CEBRSubMetrics {
  cpvs: number; // Cost-per-Verified-Success vs Scaffold Baseline (40%)
  cwr: number;  // Credit Waste Ratio (30%)
  hic: number;  // Human Intervention Cost (30%)
}

export interface EDISubMetrics {
  performance_delta: number; // Zero-shot delta vs base frontier models (40%)
  portability: number;       // Artifact & workflow exportability (35%)
  model_flexibility: number; // Multi-vendor / self-hosted capability (25%)
}

export interface SCSubMetrics {
  pir: number; // Prompt Injection Resistance (40%) - Circuit Breaker < 30
  uar: number; // Unauthorized Action Rate Score (30%)
  dpc: number; // Data Privacy & Consent (30%) - Circuit Breaker < 40
}

export interface CVSSubMetrics {
  rdr: number; // Refund & Dispute Rate (50%)
  sr: number;  // Support Responsiveness SLA (30%)
  pt: number;  // Pricing Transparency (20%)
}

export interface ASTIPillar {
  key: 'eri' | 'cebr' | 'edi' | 'sc' | 'cvs';
  name: string;
  weight: number; // 0.30, 0.25, 0.20, 0.15, 0.10
  score: number; // 0 - 100
  weighted_contribution: number;
  critique: string;
  sub_metrics: Record<string, { name: string; weight: string; raw_score: number; explanation: string }>;
}

export interface BusinessAuditResult {
  composite_score: number; // 0 - 100 (after circuit breaker check)
  raw_composite_score: number;
  circuit_breaker: CircuitBreakerStatus;
  verdict: ASTIVerdict;
  verdict_tag: string;
  verdict_action: string;
  verdict_summary: string;
  audit_tier: AuditTier;
  pillars: {
    eri: ASTIPillar;
    cebr: ASTIPillar;
    edi: ASTIPillar;
    sc: ASTIPillar;
    cvs: ASTIPillar;
  };
  fatal_flaws: [string, string, string] | string[];
  pivot_suggestions: [string, string] | string[];
  uncomfortable_question: string;
  input_summary: string;
  isFallback?: boolean;
}
