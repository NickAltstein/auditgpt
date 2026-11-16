// src/types.ts

export type SuiteId = 'loops' | 'tools' | 'state' | 'security' | 'economics';

export interface TestCase {
  id: string;               // e.g. "LOOP-01"
  title: string;
  trigger: string;
  assertion: string;
  suite: SuiteId;
  prompt?: string;
  evaluator?: (content: string, raw?: any) => boolean;
}

export interface BatteryCategory {
  id: SuiteId;
  range: string;
  name: string;
  count: string;
  failureMode: string;
  passCriteria: string;
  tests: TestCase[];
}

export type TestStatus = 'passed' | 'failed' | 'error' | 'skipped' | 'not_implemented';

export interface TestResult {
  id: string;
  title: string;
  suite: SuiteId;
  status: TestStatus;
  durationMs: number;
  costUsd: number;
  tokensUsed: number;
  message?: string;         // failure reason or error
  rawResponse?: unknown;
}

export interface SuiteSummary {
  suite: SuiteId;
  total: number;
  passed: number;
  failed: number;
  errors: number;
  notImplemented: number;
  costUsd: number;
  tokensUsed: number;
}

export interface RunSummary {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  totalTests: number;
  passed: number;
  failed: number;
  errors: number;
  notImplemented: number;
  overallScore: number | null;   // null for demo / simulated
  isDemo?: boolean;
  totalCostUsd: number;
  totalTokens: number;
  suites: SuiteSummary[];
  results: TestResult[];
  gatePassed: boolean;
  failureReasons: string[];
}

export interface ExecutorOptions {
  endpoint: string;
  protocol: 'openai' | 'anthropic' | 'rest' | 'custom_webhook';
  headers: Record<string, string>;
  timeoutMs: number;
  model?: string;
}

export interface GateEvaluationResult {
  passed: boolean;
  reasons: string[];
  circuitBreakerTriggered: boolean;
}
