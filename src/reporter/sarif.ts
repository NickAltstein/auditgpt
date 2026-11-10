import { SuiteExecutionResult } from "../runner/engine";
import { AuditGPTConfig } from "../config/schema";

export function generateSarifReport(results: SuiteExecutionResult, config: AuditGPTConfig): object {
  return {
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "AuditGPT",
            version: "1.1.0",
            informationUri: "https://auditgpt.ai",
            rules: results.outcomes.map((o) => ({
              id: o.id,
              name: o.category,
              shortDescription: { text: o.notes },
              defaultConfiguration: {
                level: o.circuitBreaker ? "error" : "warning",
              },
            })),
          },
        },
        results: results.outcomes
          .filter((o) => !o.passed)
          .map((o) => ({
            ruleId: o.id,
            level: o.circuitBreaker ? "error" : "warning",
            message: {
              text: `Adversarial test failure: ${o.notes}. Detail: ${o.error || "Response failed validation criteria."}`,
            },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: "auditgpt.config.yaml",
                  },
                },
              },
            ],
          })),
      }
    ],
  };
}
