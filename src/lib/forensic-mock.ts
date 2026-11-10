/**
 * AuditGPT.ai — Deterministic Forensic Mock Data Generator (ASTI Protocol)
 * Generates repeatable, deterministic audit results for any tool name or URL.
 *
 * API CONTRACT (For future backend integration):
 * POST /api/audit
 * Body: { input: string, url?: string, mode?: "quick" | "deep" }
 * Response: {
 *   id: string,
 *   score: number,
 *   verdict: "VERIFIED" | "CAUTION" | "CRITICAL" | "RED FLAG",
 *   pillars: [
 *     {
 *       name: "Execution Integrity",
 *       weight: 30,
 *       score: number,
 *       submetrics: [
 *         { name: "Task Completion Rate", value: number, raw: string },
 *         { name: "Credit Burn Ratio", value: number, raw: string },
 *         { name: "Silent Failure Rate", value: number, raw: string }
 *       ]
 *     }, ...
 *   ],
 *   failureModes: string[],
 *   vendorQuestions: string[],
 *   creditBurnReport: {
 *     wastedTokensPercent: number,
 *     costPerSuccessfulTask: string,
 *     baselineCost: string,
 *     markupMultiple: string
 *   },
 *   methodologyVersion: "1.0",
 *   timestamp: string
 * }
 */

export interface ForensicPillar {
  name: string;
  weight: number;
  score: number;
  submetrics: Array<{
    name: string;
    value: number;
    raw: string;
  }>;
}

export interface CreditBurnReport {
  wastedTokensPercent: number;
  costPerSuccessfulTask: string;
  baselineCost: string;
  markupMultiple: string;
}

export interface ForensicAuditResult {
  id: string;
  input: string;
  score: number;
  verdict: 'VERIFIED' | 'CAUTION' | 'CRITICAL' | 'RED FLAG';
  verdictLabel: string;
  verdictAction: string;
  summary: string;
  pillars: ForensicPillar[];
  failureModes: string[];
  vendorQuestions: string[];
  creditBurnReport: CreditBurnReport;
  methodologyVersion: string;
  timestamp: string;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 2147483647;
}

function clamp(val: number, min = 5, max = 98): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function generateMockAudit(input: string): ForensicAuditResult {
  const cleanInput = input.trim();
  const hash = simpleHash(cleanInput.toLowerCase());

  // Base score between 25-85
  const baseScore = 25 + Math.floor(hash * 60);

  // Keyword modifiers
  let score = baseScore;
  const lower = cleanInput.toLowerCase();

  if (lower.includes('wrapper') || lower.includes('chatgpt') || lower.includes('gpts')) score -= 22;
  if (lower.includes('auto') || lower.includes('rank') || lower.includes('seo')) score -= 12;
  if (lower.includes('agent') || lower.includes('autonomous')) score -= 6;
  if (lower.includes('enterprise') || lower.includes('compliance') || lower.includes('ehr')) score += 12;
  if (lower.includes('fine-tuned') || lower.includes('custom model') || lower.includes('rag')) score += 16;
  if (lower.includes('slop') || lower.includes('scam') || lower.includes('spammer')) score -= 30;

  score = clamp(score, 8, 96);

  // Pillars calculation
  const executionScore = clamp(score + (hash * 20 - 10));
  const wrapperScore = clamp(score + (hash * 30 - 15));
  const hallucinationScore = clamp(score - (hash * 25 - 12));
  const lockInScore = clamp(score - (hash * 15 - 7));
  const marketValidationScore = clamp(score + (hash * 10 - 5));

  const pillars: ForensicPillar[] = [
    {
      name: 'Execution Integrity',
      weight: 30,
      score: executionScore,
      submetrics: [
        { name: 'Task Completion Rate', value: clamp(executionScore + 4), raw: `${clamp(executionScore + 4)}% completed` },
        { name: 'Silent Failure Rate', value: clamp(100 - executionScore), raw: `${clamp(100 - executionScore)}% unflagged` },
        { name: 'Autonomous Recovery Rate', value: clamp(executionScore - 8), raw: `${clamp(executionScore - 8)}% recovered` },
      ],
    },
    {
      name: 'Wrapper Depth',
      weight: 25,
      score: wrapperScore,
      submetrics: [
        { name: 'Model Fingerprint Delta', value: wrapperScore, raw: wrapperScore > 70 ? 'Custom Fine-Tuning' : 'Raw GPT-4o Proxy' },
        { name: 'Prompt Layering Depth', value: clamp(wrapperScore - 5), raw: `${clamp(wrapperScore / 20, 1, 5)} proprietary layers` },
        { name: 'Tool Calling Density', value: clamp(wrapperScore + 2), raw: `${clamp(wrapperScore / 15, 1, 8)} active tools` },
      ],
    },
    {
      name: 'Hallucination Resistance',
      weight: 20,
      score: hallucinationScore,
      submetrics: [
        { name: 'Factual Trap Pass Rate', value: hallucinationScore, raw: `${hallucinationScore}/100 stress score` },
        { name: 'Prompt Injection Defense', value: clamp(hallucinationScore - 6), raw: `${clamp(hallucinationScore - 6)}% blocked` },
        { name: 'Constraint Drift Rate', value: clamp(100 - hallucinationScore), raw: `${clamp(100 - hallucinationScore)}% drift detected` },
      ],
    },
    {
      name: 'Portability & Lock-in',
      weight: 15,
      score: lockInScore,
      submetrics: [
        { name: 'Prompt Export Capability', value: lockInScore > 50 ? 100 : 0, raw: lockInScore > 50 ? 'Available' : 'Locked' },
        { name: 'Workflow Data Export', value: lockInScore > 60 ? 100 : 25, raw: lockInScore > 60 ? 'Full CSV/JSON' : 'Proprietary Schema' },
        { name: 'Open API Endpoints', value: lockInScore > 70 ? 100 : 0, raw: lockInScore > 70 ? 'REST / Webhooks' : 'No Open API' },
      ],
    },
    {
      name: 'Market Validation',
      weight: 10,
      score: marketValidationScore,
      submetrics: [
        { name: 'Verified Demand Gates', value: marketValidationScore, raw: `${marketValidationScore}/100 gate index` },
        { name: 'Refund & Chargeback Signal', value: clamp(100 - (hash * 40)), raw: `${(1 + hash * 6).toFixed(1)}% dispute rate` },
        { name: 'Pricing Transparency', value: marketValidationScore > 50 ? 90 : 30, raw: marketValidationScore > 50 ? 'Published' : 'Hidden Credit System' },
      ],
    },
  ];

  // Verdict calculation
  let verdict: 'VERIFIED' | 'CAUTION' | 'CRITICAL' | 'RED FLAG';
  let verdictLabel = '';
  let verdictAction = '';

  if (score >= 85) {
    verdict = 'VERIFIED';
    verdictLabel = 'AuditGPT Verified';
    verdictAction = 'Safe for production deployment with standard monitoring.';
  } else if (score >= 65) {
    verdict = 'CAUTION';
    verdictLabel = 'Verified with Conditions';
    verdictAction = 'Deploy only with human-in-the-loop oversight on high-stakes tasks.';
  } else if (score >= 45) {
    verdict = 'CRITICAL';
    verdictLabel = 'High Failure Probability';
    verdictAction = 'Excessive credit burn and silent error rate. Pilot extensively before procurement.';
  } else {
    verdict = 'RED FLAG';
    verdictLabel = 'Verified Shovelware / Do Not Deploy';
    verdictAction = 'Actively harmful to budget, data privacy, or time. Do not buy.';
  }

  // Credit Burn calculation
  const creditBurn = Math.round(12 + hash * 62);
  const costPerTask = (0.04 + hash * 1.85).toFixed(2);
  const baselineCost = (0.01 + hash * 0.28).toFixed(2);
  const markupMultiple = (1.8 + hash * 7.4).toFixed(1);

  // Failure Modes
  const failureModes: string[] = [];
  const lowPillar = pillars.reduce((prev, curr) => (curr.score < prev.score ? curr : prev), pillars[0]);
  
  if (lowPillar && lowPillar.score < 60) {
    failureModes.push(`${lowPillar.name} is critically deficient at ${lowPillar.score}/100 under adversarial load.`);
  }
  failureModes.push(`${creditBurn}% of total consumed credits are burned on hallucinated loopbacks and unflagged retries.`);
  
  const wrapperRisk = Math.round(hash * 100);
  if (wrapperRisk > 60 || wrapperScore < 50) {
    failureModes.push('High probability of shallow API proxying with zero proprietary defensibility or fine-tuned weights.');
  } else {
    failureModes.push('Evidence of custom prompt scaffolding, but severe vendor lock-in with restricted artifact export.');
  }

  // Vendor Questions
  const vendorQuestions = [
    `"What is your audited cost-per-successful deliverable, factoring in failed loops and silent retries?"`,
    `"Can our team export 100% of our prompt configurations, system traces, and workflow states via an open API?"`,
  ];

  return {
    id: `AG-${Math.abs(Math.floor(hash * 900000 + 100000))}`,
    input: cleanInput,
    score,
    verdict,
    verdictLabel,
    verdictAction,
    summary: score < 45
      ? 'A marked-up foundation model wrapper with catastrophic credit waste and zero data portability.'
      : score < 65
      ? 'Exhibits baseline task completion but suffers from excessive token drift and prompt injection risks.'
      : score < 85
      ? 'Functional multi-agent workflow, but proprietary lock-in and high markup warrant contract scrutiny.'
      : 'Genuinely differentiated architecture with low silent failure rates and transparent unit economics.',
    pillars,
    failureModes,
    vendorQuestions,
    creditBurnReport: {
      wastedTokensPercent: creditBurn,
      costPerSuccessfulTask: `$${costPerTask}`,
      baselineCost: `$${baselineCost}`,
      markupMultiple: `${markupMultiple}x`,
    },
    methodologyVersion: '1.0',
    timestamp: new Date().toISOString(),
  };
}
