'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, GitPullRequest, ShieldCheck, FileCode, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_CONFIG_YAML = `# yaml-language-server: $schema=https://auditgpt.ai/auditgpt.schema.json
version: "1.1"

target:
  endpoint: "http://localhost:8000/agent/v1/chat"
  protocol: "openai" # Options: openai | anthropic | rest | custom_webhook
  model: "gpt-4o-mini"
  headers:
    Authorization: "Bearer \${AGENT_API_KEY}"
  timeout_ms: 30000

testing:
  suites: ["loops", "tools", "state", "security", "economics"]
  concurrency: 5
  runs_per_test: 1

bounds:
  max_cost_per_task_usd: 0.15
  max_tokens_per_task: 4000
  max_total_budget_usd: 5.00

gates:
  pass_threshold: 80.0
  fail_on_injection: true
  fail_on_unauthorized_tool: true
  fail_on_infinite_loop: true
  min_deterministic_parity: 75.0

reporting:
  formats: ["terminal", "markdown", "sarif"]
  export_pr_comment: "audit_summary.md"
  export_sarif: "audit_results.sarif"
  ci_mode: true`;

const SAMPLE_GITHUB_ACTION = `name: "AuditGPT Defense Gate"

on:
  pull_request:
    branches: [main, staging]
    paths:
      - 'agents/**'
      - 'prompts/**'
      - 'tools/**'

jobs:
  agent-defense-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Start Staging Agent
        run: docker compose up -d agent-staging && sleep 5

      - name: Run AuditGPT CI Crash-Test
        run: |
          npx auditgpt test \\
            --config auditgpt.config.yaml \\
            --export-pr-comment audit_summary.md \\
            --export-sarif audit_results.sarif

      - name: Post PR Summary Comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            if (fs.existsSync('audit_summary.md')) {
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: fs.readFileSync('audit_summary.md', 'utf8')
              });
            }

      - name: Upload SARIF to GitHub Security Tab
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: audit_results.sarif`;

export function CliGateSection() {
  const [activeTab, setActiveTab] = useState<'config' | 'action'>('config');
  const [copiedCode, setCopiedCode] = useState(false);

  const copyActiveCode = () => {
    const code = activeTab === 'config' ? SAMPLE_CONFIG_YAML : SAMPLE_GITHUB_ACTION;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success(`${activeTab === 'config' ? 'auditgpt.config.yaml' : 'auditgpt-gate.yml'} copied`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText('npx auditgpt test --ci');
    toast.success('Command copied: npx auditgpt test --ci');
  };

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#58718a]">
            Developer Integration
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-4xl text-[#242426] font-bold">
            Zero-Dependency CLI &amp; GitHub Action Defense Gate
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-[#58718a]">
            Run ASTI v1.1 locally in one command. Block breaking prompt and tool changes in your CI pipeline.
          </p>
        </div>

        {/* Quick CLI Bar */}
        <div className="mt-8 mx-auto max-w-xl">
          <div className="flex items-center justify-between rounded-full border border-[rgba(36,36,38,0.08)] bg-white px-4 py-2 shadow-xs">
            <div className="flex items-center gap-2 font-mono text-xs text-[#242426]">
              <Terminal className="h-4 w-4 text-[#58718a]" />
              <span>npx auditgpt test --ci</span>
            </div>
            <button
              type="button"
              onClick={copyCliCommand}
              aria-label="Copy CLI command"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-[#ebeff5] px-4 py-1.5 font-mono text-xs font-semibold text-[#242426] hover:bg-[#9EFFA9] cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Tabbed Code Container */}
        <div className="makro-card mt-8 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[rgba(36,36,38,0.08)] bg-[#f8fafc] px-3.5 sm:px-6 py-2.5 sm:py-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                aria-label="View auditgpt.config.yaml"
                className={`flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-mono transition-all cursor-pointer ${
                  activeTab === 'config'
                    ? 'bg-white text-[#242426] font-bold shadow-2xs'
                    : 'text-[#58718a] hover:text-[#242426]'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">auditgpt.config.yaml</span>
                <span className="sm:hidden">config.yaml</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('action')}
                aria-label="View GitHub Actions workflow"
                className={`flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-mono transition-all cursor-pointer ${
                  activeTab === 'action'
                    ? 'bg-white text-[#242426] font-bold shadow-2xs'
                    : 'text-[#58718a] hover:text-[#242426]'
                }`}
              >
                <GitPullRequest className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">.github/workflows/auditgpt-gate.yml</span>
                <span className="sm:hidden">gate.yml</span>
              </button>
            </div>

            <button
              type="button"
              onClick={copyActiveCode}
              aria-label="Copy active file content"
              className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[rgba(36,36,38,0.08)] bg-white px-3 sm:px-3.5 py-1.5 text-xs font-mono text-[#242426] transition-colors hover:bg-[#9EFFA9] cursor-pointer"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-[#16a34a]" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="bg-[#242426] p-6 text-xs text-[#ffffffbf] font-mono overflow-x-auto">
            <pre>
              <code>{activeTab === 'config' ? SAMPLE_CONFIG_YAML : SAMPLE_GITHUB_ACTION}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
