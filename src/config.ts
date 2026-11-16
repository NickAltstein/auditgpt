// src/config.ts
import { z } from 'zod';
import { readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import path from 'path';

export const AuditGPTConfigSchema = z.object({
  version: z.string().default('1.1'),

  target: z.object({
    endpoint: z.string().url('Must be a valid URL'),
    protocol: z.enum(['openai', 'anthropic', 'rest', 'custom_webhook']).default('openai'),
    model: z.string().optional(),
    headers: z.record(z.string(), z.string()).default({}),
    timeout_ms: z.number().int().positive().default(30_000),
  }),

  testing: z.object({
    suites: z
      .array(z.enum(['loops', 'tools', 'state', 'security', 'economics']))
      .min(1)
      .default(['loops', 'tools', 'state', 'security', 'economics']),
    concurrency: z.number().int().min(1).max(20).default(5),
    runs_per_test: z.number().int().min(1).max(5).default(1),
  }).optional().default({
    suites: ['loops', 'tools', 'state', 'security', 'economics'],
    concurrency: 5,
    runs_per_test: 1,
  }),

  bounds: z.object({
    max_cost_per_task_usd: z.number().positive().default(0.15),
    max_tokens_per_task: z.number().int().positive().default(4000),
    max_total_budget_usd: z.number().positive().default(5.0),
  }).optional().default({
    max_cost_per_task_usd: 0.15,
    max_tokens_per_task: 4000,
    max_total_budget_usd: 5.0,
  }),

  gates: z.object({
    pass_threshold: z.number().min(0).max(100).default(80.0),
    fail_on_injection: z.boolean().default(true),
    fail_on_unauthorized_tool: z.boolean().default(true),
    fail_on_infinite_loop: z.boolean().default(true),
    min_deterministic_parity: z.number().min(0).max(100).default(75.0),
  }).optional().default({
    pass_threshold: 80.0,
    fail_on_injection: true,
    fail_on_unauthorized_tool: true,
    fail_on_infinite_loop: true,
    min_deterministic_parity: 75.0,
  }),

  reporting: z.object({
    formats: z
      .array(z.enum(['terminal', 'markdown', 'sarif', 'json']))
      .default(['terminal', 'markdown']),
    export_pr_comment: z.string().optional(),
    export_sarif: z.string().optional(),
    export_json: z.string().optional(),
    ci_mode: z.boolean().default(false),
  }).optional().default({
    formats: ['terminal', 'markdown'],
    ci_mode: false,
  }),
});

export type AuditGPTConfig = z.infer<typeof AuditGPTConfigSchema>;

/**
 * Load and validate configuration from YAML file or CLI overrides
 */
export function loadConfig(
  configPath: string = 'auditgpt.config.yaml',
  cliOverrides: any = {}
): AuditGPTConfig {
  let fileConfig: any = {};

  try {
    const absolutePath = path.resolve(process.cwd(), configPath);
    const raw = readFileSync(absolutePath, 'utf-8');
    fileConfig = parseYaml(raw) || {};
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw new Error(`Failed to parse config file: ${(err as Error).message}`);
    }
  }

  // Deep merge: file config ← CLI overrides
  const merged = deepMerge(fileConfig, cliOverrides);

  const result = AuditGPTConfigSchema.safeParse(merged);

  if (!result.success) {
    const formatted = (result.error as any).issues
      ? (result.error as any).issues.map((issue: any) => `  • ${issue.path.join('.')}: ${issue.message}`).join('\n')
      : result.error.message;
    throw new Error(`Invalid AuditGPT configuration:\n${formatted}`);
  }

  return result.data;
}

/** Simple deep merge helper */
function deepMerge(target: any, source: any): any {
  if (typeof source !== 'object' || source === null) return source;
  const output = { ...(target || {}) };

  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(target?.[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      output[key] = source[key];
    }
  }
  return output;
}
