import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

/**
 * Resolves `${ENV_VAR}` references against process.env
 */
const envInterpolatedString = z.string().transform((val) => {
  return val.replace(/\$\{([^}]+)\}/g, (_, envVarName) => {
    const envVal = process.env[envVarName];
    if (envVal === undefined) {
      throw new Error(`Environment variable '${envVarName}' referenced in config is not set.`);
    }
    return envVal;
  });
});

export const ProtocolEnum = z.enum(["openai", "anthropic", "rest", "custom_webhook"]);
export const TestSuiteEnum = z.enum(["loops", "tools", "state", "security", "economics", "all"]);
export const ReportFormatEnum = z.enum(["terminal", "markdown", "json", "sarif", "pdf"]);

export const TargetConfigSchema = z.object({
  endpoint: z.string().url("Target endpoint must be a valid HTTP/HTTPS URL"),
  protocol: ProtocolEnum.default("openai"),
  model: z.string().optional(),
  headers: z.record(z.string(), envInterpolatedString).default({}),
  timeout_ms: z.number().int().positive().default(30000),
});

export const TestingConfigSchema = z.object({
  suites: z.array(TestSuiteEnum).min(1, "At least one test suite must be enabled").default(["all"]),
  concurrency: z.number().int().min(1).max(32).default(5),
  runs_per_test: z.number().int().min(1).max(10).default(1),
  skip_tests: z.array(z.string()).default([]),
  custom_fixtures_dir: z.string().optional(),
});

export const BoundsConfigSchema = z.object({
  max_cost_per_task_usd: z.number().positive().default(0.15),
  max_tokens_per_task: z.number().int().positive().default(4000),
  max_total_budget_usd: z.number().positive().default(5.00),
  max_retries: z.number().int().nonnegative().default(3),
});

export const GatesConfigSchema = z.object({
  pass_threshold: z.number().min(0).max(100).default(80.0),
  fail_on_injection: z.boolean().default(true),
  fail_on_unauthorized_tool: z.boolean().default(true),
  fail_on_infinite_loop: z.boolean().default(true),
  min_deterministic_parity: z.number().min(0).max(100).default(75.0),
});

export const ReportingConfigSchema = z.object({
  formats: z.array(ReportFormatEnum).default(["terminal", "markdown"]),
  export_pr_comment: z.string().optional(),
  export_sarif: z.string().optional(),
  ci_mode: z.boolean().default(true),
  cloud_sync: z
    .object({
      api_key_env: z.string().default("AUDITGPT_API_KEY"),
      project_id: z.string(),
    })
    .optional(),
});

export const AuditGPTConfigSchema = z
  .object({
    version: z.string().regex(/^1\.[0-9]+$/, "Schema version must be 1.x (e.g., '1.1')"),
    target: TargetConfigSchema,
    testing: TestingConfigSchema.optional().default({
      suites: ["all"],
      concurrency: 5,
      runs_per_test: 1,
      skip_tests: [],
    }),
    bounds: BoundsConfigSchema.optional().default({
      max_cost_per_task_usd: 0.15,
      max_tokens_per_task: 4000,
      max_total_budget_usd: 5.00,
      max_retries: 3,
    }),
    gates: GatesConfigSchema.optional().default({
      pass_threshold: 80.0,
      fail_on_injection: true,
      fail_on_unauthorized_tool: true,
      fail_on_infinite_loop: true,
      min_deterministic_parity: 75.0,
    }),
    reporting: ReportingConfigSchema.optional().default({
      formats: ["terminal", "markdown"],
      ci_mode: true,
    }),
  })
  .strict();

export type AuditGPTConfig = z.infer<typeof AuditGPTConfigSchema>;

/**
 * Loads, parses, and validates `auditgpt.config.yaml` or `auditgpt.config.json`
 */
export function loadAuditGPTConfig(configPath?: string): AuditGPTConfig {
  const resolvedPath = configPath
    ? path.resolve(process.cwd(), configPath)
    : findDefaultConfigFile();

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`AuditGPT config file not found at: ${resolvedPath}`);
  }

  const rawFile = fs.readFileSync(resolvedPath, "utf-8");
  let parsedContent: unknown;

  if (resolvedPath.endsWith(".json")) {
    parsedContent = JSON.parse(rawFile);
  } else {
    parsedContent = yaml.load(rawFile);
  }

  const result = AuditGPTConfigSchema.safeParse(parsedContent);

  if (!result.success) {
    const errorDetails = (result.error as any).issues
      ? (result.error as any).issues.map((err: any) => `  - [${err.path.join(".")}]: ${err.message}`).join("\n")
      : result.error.message;
    throw new Error(`Invalid AuditGPT configuration in '${resolvedPath}':\n${errorDetails}`);
  }

  return result.data;
}

function findDefaultConfigFile(): string {
  const candidates = [
    "auditgpt.config.yaml",
    "auditgpt.config.yml",
    "auditgpt.config.json",
    ".auditgptrc.yaml",
    ".auditgptrc.json",
  ];

  for (const file of candidates) {
    const candidatePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  throw new Error(
    "No configuration file found. Please create an `auditgpt.config.yaml` in the root directory."
  );
}
