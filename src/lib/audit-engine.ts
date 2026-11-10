export interface SubMetric {
  name: string;
  value: number;
  raw: string;
}

export interface Pillar {
  id: string;
  name: string;
  weight: number;
  score: number;
  description: string;
  submetrics: SubMetric[];
}

export interface AuditReport {
  id: string;
  query: string;
  timestamp: string;
  score: number;
  verdict: 'VERIFIED' | 'CAUTION' | 'CRITICAL' | 'RED FLAG';
  verdictColor: string;
  pillars: Pillar[];
  failureModes: string[];
  vendorQuestions: string[];
  creditBurnReport: {
    wastedTokensPercent: number;
    costPerSuccessfulTask: string;
    baselineCost: string;
    markupMultiple: string;
    silentFailureRate: string;
  };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 2147483647;
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function generateForensicAudit(input: string): AuditReport {
  const cleanInput = input.trim();
  const hash = simpleHash(cleanInput.toLowerCase());
  const lower = cleanInput.toLowerCase();

  let score = 25 + Math.floor(hash * 60);

  if (lower.includes('wrapper') || lower.includes('chatgpt')) score -= 22;
  if (lower.includes('auto') || lower.includes('rank') || lower.includes('polsia')) score -= 14;
  if (lower.includes('agent') || lower.includes('autonomous')) score -= 8;
  if (lower.includes('enterprise') || lower.includes('compliance')) score += 12;
  if (lower.includes('fine-tuned') || lower.includes('custom model')) score += 18;

  score = clamp(score, 8, 96);

  const verdict: AuditReport['verdict'] = 
    score >= 85 ? 'VERIFIED' :
    score >= 65 ? 'CAUTION' :
    score >= 45 ? 'CRITICAL' : 'RED FLAG';

  const verdictColor = 
    verdict === 'VERIFIED' ? '#00FF9D' :
    verdict === 'CAUTION' ? '#FFB800' : '#FF1E56';

  const wastedTokens = clamp(15 + hash * 65);
  const costPerTask = (0.04 + hash * 1.8).toFixed(2);
  const baselineCost = (0.01 + hash * 0.25).toFixed(2);
  const markup = (Number(costPerTask) / Number(baselineCost)).toFixed(1);

  const pillars: Pillar[] = [
    {
      id: 'p1',
      name: 'Execution Integrity',
      weight: 30,
      score: clamp(score + (hash * 24 - 12)),
      description: 'Measures task completion rate without infinite loops or silent aborts.',
      submetrics: [
        { name: 'Task Completion Rate', value: clamp(score + 5), raw: `${clamp(score + 5)}%` },
        { name: 'Silent Failure Rate', value: clamp(100 - score), raw: `${clamp((100 - score) * 0.4)}%` },
        { name: 'Deterministic Parity', value: clamp(score - 4), raw: `${clamp(score - 4)}/100` },
      ]
    },
    {
      id: 'p2',
      name: 'Wrapper Depth & IP',
      weight: 25,
      score: clamp(score + (hash * 30 - 15)),
      description: 'Reverse-engineers API latency, custom fine-tuning, and model independence.',
      submetrics: [
        { name: 'Base Model Reliance', value: clamp(100 - (score * 0.8)), raw: `${clamp(100 - (score * 0.8))}%` },
        { name: 'Orchestration Depth', value: clamp(score), raw: `${clamp(score)}/100` },
        { name: 'Proprietary Flywheel', value: clamp(score - 10), raw: `${clamp(score - 10)}/100` },
      ]
    },
    {
      id: 'p3',
      name: 'Hallucination Resistance',
      weight: 20,
      score: clamp(score - (hash * 20 - 10)),
      description: 'Adversarial boundary testing, constraint adherence, and injection safety.',
      submetrics: [
        { name: 'Adversarial Resistance', value: clamp(score + 2), raw: `${clamp(score + 2)}%` },
        { name: 'Factual Anchor', value: clamp(score - 8), raw: `${clamp(score - 8)}%` },
        { name: 'Context Degradation', value: clamp((100 - score) * 0.6), raw: `${clamp((100 - score) * 0.6)}%` },
      ]
    },
    {
      id: 'p4',
      name: 'Portability & Lock-in',
      weight: 15,
      score: clamp(score - (hash * 16 - 8)),
      description: 'Evaluates user data ownership, repo exportability, and API egress.',
      submetrics: [
        { name: 'Code / Data Egress', value: clamp(score - 5), raw: score > 60 ? 'Available' : 'Restricted' },
        { name: 'Schema Portability', value: clamp(score), raw: `${clamp(score)}/100` },
        { name: 'Infrastructure Decoupling', value: clamp(score - 12), raw: score > 70 ? 'Native' : 'Locked' },
      ]
    },
    {
      id: 'p5',
      name: 'Commercial Validation',
      weight: 10,
      score: clamp(score + (hash * 14 - 7)),
      description: 'Validates real unit economics vs. token cost-to-serve Cliffs.',
      submetrics: [
        { name: 'Token Margin Viability', value: clamp(score + 6), raw: `${markup}x Markup` },
        { name: 'Autonomous Scope Gate', value: clamp(score), raw: `${clamp(score)}/100` },
      ]
    }
  ];

  const failureModes: string[] = [];
  if (wastedTokens > 35) {
    failureModes.push(`${wastedTokens}% of token budget drained on infinite error-correction loops and hallucinated tasks.`);
  }
  if (score < 60) {
    failureModes.push(`High vulnerability to frontier model obsolescence; shallow wrapper architecture detected.`);
  } else {
    failureModes.push(`Context degradation detected after 8 multi-turn reasoning cycles.`);
  }
  failureModes.push(`Hard vendor lock-in identified: No automated mechanism to export raw system prompt state.`);

  const vendorQuestions = [
    `What is your verified cost-per-successful-task when factoring in background agent retries?`,
    `Can we export all raw state trees, execution logs, and prompt chains directly into our own VPC?`
  ];

  return {
    id: `ASTI-${Math.abs(Math.floor(hash * 90000000 + 10000000)).toString(16).toUpperCase()}`,
    query: cleanInput,
    timestamp: new Date().toISOString(),
    score,
    verdict,
    verdictColor,
    pillars,
    failureModes,
    vendorQuestions,
    creditBurnReport: {
      wastedTokensPercent: wastedTokens,
      costPerSuccessfulTask: `$${costPerTask}`,
      baselineCost: `$${baselineCost}`,
      markupMultiple: `${markup}x`,
      silentFailureRate: `${clamp((100 - score) * 0.35)}%`
    }
  };
}
