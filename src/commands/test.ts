// src/commands/test.ts
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../config';
import { BATTERY_CATEGORIES } from '../battery/categories';
import { runBattery } from '../runner/executor';
import { evaluateGates } from '../runner/assertions';
import { generateReports } from '../runner/reporter';
import type { RunSummary, TestCase } from '../types';

interface CliOptions {
  endpoint?: string;
  config?: string;
  demo?: boolean;
  maxCostPerTask?: string;
  failOnInjection?: boolean;
  exportPrComment?: string;
  exportSarif?: string;
  ci?: boolean;
}

export async function runTestCommand(options: CliOptions) {
  const fs = await import('fs');
  const path = await import('path');
  const hasConfigFile = fs.existsSync(path.resolve(process.cwd(), options.config || 'auditgpt.config.yaml'));
  const isDemo = Boolean(options.demo) || (!options.endpoint && !hasConfigFile);

  const defaultEndpoint = isDemo ? 'mock://reference-agent' : 'http://localhost:8000/agent/v1/chat';

  const spinner = ora('Loading configuration...').start();

  try {
    if (isDemo) {
      spinner.info(chalk.cyan.bold('⚡ Zero-config demo mode: executing ASTI v1.1 battery against reference agent fixture.'));
      console.log(chalk.gray('💡 To test your live agent:  npx auditgpt test --endpoint http://localhost:8000/agent'));
      console.log(chalk.gray('💡 To scaffold local config: npx auditgpt init\n'));
      spinner.start('Running ASTI v1.1 battery against reference fixture');
    }

    // 1. Load + validate config (file + CLI overrides)
    const config = loadConfig(options.config || 'auditgpt.config.yaml', {
      target: {
        endpoint: options.endpoint || defaultEndpoint,
      },
      bounds: {
        max_cost_per_task_usd: options.maxCostPerTask
          ? Number(options.maxCostPerTask)
          : undefined,
      },
      gates: {
        fail_on_injection: options.failOnInjection,
      },
      reporting: {
        export_pr_comment: options.exportPrComment,
        export_sarif: options.exportSarif,
        ci_mode: options.ci ?? false,
      },
    });

    if (!config.target.endpoint) {
      spinner.fail('No endpoint provided. Use --endpoint or set it in auditgpt.config.yaml');
      process.exit(1);
    }

    spinner.text = `Running ASTI v1.1 battery against ${config.target.endpoint}`;

    // 2. Select tests based on configured suites
    const selectedTests: TestCase[] = BATTERY_CATEGORIES
      .filter((cat) => config.testing.suites.includes(cat.id))
      .flatMap((cat) => cat.tests);

    if (selectedTests.length === 0) {
      spinner.fail('No test suites selected.');
      process.exit(1);
    }

    // 3. Execute the battery
    const summary: RunSummary = await runBattery({
      tests: selectedTests,
      config,
      onProgress: (completed, total) => {
        spinner.text = `Running ASTI v1.1  [${completed}/${total}]`;
      },
    });

    spinner.stop();

    // 4. Evaluate gates
    const gateResult = evaluateGates(summary, config.gates, config.bounds);

    // 5. Generate reports (terminal + optional files)
    await generateReports(summary, gateResult, config.reporting);

    // 6. Exit code for CI
    if (config.reporting.ci_mode || options.ci) {
      process.exit(gateResult.passed ? 0 : 1);
    }

    // Interactive mode summary
    if (gateResult.passed) {
      console.log(chalk.green.bold('\n✓ GATE PASSED') + `  Score: ${summary.overallScore.toFixed(1)}%`);
    } else {
      console.log(chalk.red.bold('\n✗ GATE FAILED'));
      gateResult.reasons.forEach((r) => console.log(chalk.red(`  • ${r}`)));
      process.exitCode = 1;
    }
  } catch (err) {
    spinner.fail('AuditGPT failed');
    console.error(chalk.red((err as Error).message));
    process.exit(1);
  }
}
