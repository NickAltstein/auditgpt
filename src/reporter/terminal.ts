/**
 * Terminal Visual Renderer (src/reporter/terminal.ts)
 */

import { SuiteExecutionResult } from "../runner/engine";

export function renderTerminalOutput(results: SuiteExecutionResult, isDemoMode: boolean = false): void {
  console.log(`\x1b[1m═══════════════════════════════════════════════════════════════════\x1b[0m`);
  console.log(`\x1b[36m\x1b[1m  ASTI v1.1 ADVERSARIAL STRESS-TEST RESULTS${isDemoMode ? " (DEMO MODE)" : ""}\x1b[0m`);
  console.log(`\x1b[1m═══════════════════════════════════════════════════════════════════\x1b[0m\n`);

  console.log(`\x1b[1mSuite Performance Breakdown:\x1b[0m`);
  for (const [suite, score] of Object.entries(results.suiteScores)) {
    const barLength = Math.round(score / 5);
    const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);
    const color = score >= 80 ? "\x1b[32m" : score >= 60 ? "\x1b[33m" : "\x1b[31m";
    console.log(`  \x1b[90m${suite.padEnd(12)}\x1b[0m [${color}${bar}\x1b[0m] ${color}${score}%\x1b[0m`);
  }

  console.log(`\n\x1b[1mEconomic Telemetry${isDemoMode ? " (Simulated)" : ""}:\x1b[0m`);
  console.log(`  • Tests Executed: \x1b[37m\x1b[1m${results.totalTests}\x1b[0m (\x1b[32m${results.passedCount} passed\x1b[0m, \x1b[31m${results.failedCount} failed\x1b[0m)`);
  console.log(`  • Total Tokens Burned: \x1b[35m${results.tokenConsumption.totalTokens.toLocaleString()}\x1b[0m (avg ${results.tokenConsumption.avgTokensPerTask}/task)${isDemoMode ? " (simulated)" : ""}`);
  console.log(`  • Total Test Spend: \x1b[33m$${results.tokenConsumption.totalCostUsd.toFixed(4)}\x1b[0m${isDemoMode ? " (simulated)" : ""}`);
  console.log(`  • Avg Latency: \x1b[36m${results.tokenConsumption.avgLatencySec}s\x1b[0m`);

  const failures = results.outcomes.filter((o) => !o.passed);
  if (failures.length > 0) {
    console.log(`\n\x1b[31m\x1b[1mFailed Adversarial Traps (${failures.length}):\x1b[0m`);
    for (const f of failures.slice(0, 5)) {
      console.log(`  \x1b[31m✖ [${f.id}]\x1b[0m \x1b[90m${f.notes}\x1b[0m - ${f.error || "Assertion failed"}`);
    }
    if (failures.length > 5) {
      console.log(`  \x1b[90m... and ${failures.length - 5} more failures.\x1b[0m`);
    }
  }

  console.log(`\n\x1b[1m═══════════════════════════════════════════════════════════════════\x1b[0m`);
  console.log(`  \x1b[1mComposite Score: \x1b[0m${results.compositeScore >= 80 ? "\x1b[32m" : "\x1b[31m"}\x1b[1m${results.compositeScore}/100\x1b[0m`);
  console.log(`\x1b[1m═══════════════════════════════════════════════════════════════════\x1b[0m`);
}
