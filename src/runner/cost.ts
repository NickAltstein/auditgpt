// src/runner/cost.ts

export interface TokenCostEstimate {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
}

/**
 * Estimate cost based on standard model inference rates
 * Defaults to $0.15/1M input, $0.60/1M output
 */
export function calculateTokenCost(
  promptTokens: number = 150,
  completionTokens: number = 80,
  model?: string
): TokenCostEstimate {
  const totalTokens = promptTokens + completionTokens;
  const promptRate = 0.00000015;
  const completionRate = 0.0000006;

  const costUsd = Number(
    (promptTokens * promptRate + completionTokens * completionRate).toFixed(6)
  );

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd,
  };
}
