// src/runner/reporter.ts
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import type { RunSummary, GateEvaluationResult } from '../types';
import type { AuditGPTConfig } from '../config';

export async function generateReports(
  summary: RunSummary,
  gateResult: GateEvaluationResult,
  reporting: AuditGPTConfig['reporting']
): Promise<void> {
  // 1. Terminal Output
  renderTerminalReport(summary, gateResult);

  // 2. Markdown PR Comment Export
  if (reporting.export_pr_comment) {
    const md = buildMarkdownPrComment(summary, gateResult);
    const resolvedPath = path.resolve(process.cwd(), reporting.export_pr_comment);
    fs.writeFileSync(resolvedPath, md, 'utf-8');
    console.log(chalk.cyan(`[+] PR Comment summary written to: ${reporting.export_pr_comment}`));
  }

  // 3. SARIF Export
  if (reporting.export_sarif) {
    const sarif = buildSarifReport(summary);
    const resolvedPath = path.resolve(process.cwd(), reporting.export_sarif);
    fs.writeFileSync(resolvedPath, JSON.stringify(sarif, null, 2), 'utf-8');
    console.log(chalk.cyan(`[+] SARIF vulnerability report written to: ${reporting.export_sarif}`));
  }

  // 4. JSON Export
  if (reporting.export_json) {
    const resolvedPath = path.resolve(process.cwd(), reporting.export_json);
    fs.writeFileSync(resolvedPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(chalk.cyan(`[+] JSON report written to: ${reporting.export_json}`));
  }
}

function renderTerminalReport(summary: RunSummary, gateResult: GateEvaluationResult): void {
  console.log('\n' + chalk.bold.magenta('⚡ AuditGPT ASTI v1.1 Defense Gate Results'));
  console.log(chalk.gray('═'.repeat(65)));

  console.log(chalk.bold('\nSuite Performance:'));
  for (const s of summary.suites) {
    const pct = s.total > 0 ? Math.round((s.passed / s.total) * 100) : 100;
    const barLength = Math.round(pct / 5);
    const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
    const color = pct >= 80 ? chalk.green : pct >= 60 ? chalk.yellow : chalk.red;
    console.log(`  ${chalk.gray(s.suite.padEnd(12))} [${color(bar)}] ${color(`${pct}%`)} (${s.passed}/${s.total})`);
  }

  console.log(chalk.bold('\nEconomic Telemetry:'));
  console.log(`  • Tests Executed: ${chalk.white.bold(summary.totalTests)} (${chalk.green(`${summary.passed} passed`)}, ${chalk.red(`${summary.failed + summary.errors} failed`)})`);
  console.log(`  • Tokens Consumed: ${chalk.magenta(summary.totalTokens.toLocaleString())} tokens (avg ${Math.round(summary.totalTokens / (summary.totalTests || 1))}/task)`);
  console.log(`  • Total Test Spend: ${chalk.yellow(`$${summary.totalCostUsd.toFixed(4)}`)}`);
  console.log(`  • Execution Duration: ${chalk.cyan(`${(summary.durationMs / 1000).toFixed(2)}s`)}`);

  const failures = summary.results.filter((r) => r.status === 'failed' || r.status === 'error');
  if (failures.length > 0) {
    console.log(chalk.bold.red(`\nFailed Adversarial Vectors (${failures.length}):`));
    for (const f of failures.slice(0, 5)) {
      console.log(`  ${chalk.red('✖')} [${chalk.bold(f.id)}] ${chalk.gray(f.title)} - ${f.message || 'Assertion failed'}`);
    }
    if (failures.length > 5) {
      console.log(chalk.gray(`  ... and ${failures.length - 5} more failures. View exported reports for details.`));
    }
  }

  console.log('\n' + chalk.gray('═'.repeat(65)));
  const scoreColor = summary.overallScore >= 80 ? chalk.green.bold : chalk.red.bold;
  console.log(`  ${chalk.bold('Overall Composite Score:')} ${scoreColor(`${summary.overallScore.toFixed(1)}/100`)}`);
  console.log(chalk.gray('═'.repeat(65)));
}

function buildMarkdownPrComment(summary: RunSummary, gateResult: GateEvaluationResult): string {
  const status = gateResult.passed
    ? '🟢 **PASSED CI DEFENSE GATE**'
    : '🔴 **BLOCKED (CI MERGE GATE FAILED)**';

  const rows = summary.suites.map((s) => {
    const pct = s.total > 0 ? Math.round((s.passed / s.total) * 100) : 100;
    return `| **${s.suite}** | \`${pct}%\` | \`${s.passed}\` | \`${s.failed + s.errors}\` | \`$${s.costUsd.toFixed(4)}\` | ${getSuiteFocus(s.suite)} |`;
  });

  const lines = [
    '## ⚡ AuditGPT Agent Defense Gate Report',
    `**Status:** ${status} | **Composite Score:** \`${summary.overallScore.toFixed(1)}/100\``,
    `**Completed:** \`${summary.finishedAt}\` | **Duration:** \`${(summary.durationMs / 1000).toFixed(2)}s\``,
    '',
    '### 🛡️ ASTI v1.1 Suite Breakdown',
    '| Suite Vector | Score | Passed | Failed | Spend | Focus |',
    '| :--- | :---: | :---: | :---: | :---: | :--- |',
    ...rows,
    '',
    '### 📊 Telemetry & Resource Bounds',
    `- **Invocations:** \`${summary.totalTests}\` (\`${summary.passed}\` Passed / \`${summary.failed + summary.errors}\` Failed)`,
    `- **Tokens Burned:** \`${summary.totalTokens.toLocaleString()}\` tokens (Avg \`${Math.round(summary.totalTokens / (summary.totalTests || 1))}\`/task)`,
    `- **Total Cost:** \`$${summary.totalCostUsd.toFixed(4)}\` (Avg \`$${(summary.totalCostUsd / (summary.totalTests || 1)).toFixed(4)}\`/task)`,
  ];

  if (!gateResult.passed && gateResult.reasons.length > 0) {
    lines.push('', '### 🚨 Gate Failure Reasons (Merge Blocked)');
    for (const r of gateResult.reasons) {
      lines.push(`- ❌ ${r}`);
    }
  }

  lines.push('', '---', '*Generated automatically by [AuditGPT.ai](https://auditgpt.ai) CI/CD Defense Gate.*');
  return lines.join('\n');
}

function getSuiteFocus(suite: string): string {
  switch (suite) {
    case 'loops':
      return 'Recursive retries & 500 error traps';
    case 'tools':
      return 'Destructive tool calls & parameter drift';
    case 'state':
      return 'Multi-turn degradation & false premises';
    case 'security':
      return 'System prompt leaks & jailbreaks';
    case 'economics':
      return 'Runaway inference spend & reasoning bounds';
    default:
      return 'Systemic agent invariants';
  }
}

function buildSarifReport(summary: RunSummary): object {
  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'AuditGPT',
            version: '1.1.0',
            informationUri: 'https://auditgpt.ai',
            rules: summary.results.map((r) => ({
              id: r.id,
              name: r.suite,
              shortDescription: { text: r.title },
              defaultConfiguration: {
                level: r.suite === 'security' ? 'error' : 'warning',
              },
            })),
          },
        },
        results: summary.results
          .filter((r) => r.status === 'failed' || r.status === 'error')
          .map((r) => ({
            ruleId: r.id,
            level: r.suite === 'security' ? 'error' : 'warning',
            message: {
              text: `Adversarial failure in ${r.title}: ${r.message || 'Assertion failed'}`,
            },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: 'auditgpt.config.yaml',
                  },
                },
              },
            ],
          })),
      },
    ],
  };
}
