import { createHash, generateKeyPairSync, sign, verify } from "node:crypto";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Cpu,
  FileCheck2,
  FileCode2,
  Fingerprint,
  GitPullRequest,
  Hash,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { InvoiceCaseStudyProof } from "@/components/InvoiceCaseStudyProof";
import styles from "../homepage.module.css";

const title = "Receiptd | Runtime Execution Boundary & Cryptographic Receipts for AI Agents";
const description =
  "Open-source fail-closed PreToolUse hook for Claude Code and MCP agents. Evaluates policy in 0.02ms in-process (~78ms cold hook), halts destructive actions with exit code 2, and produces Ed25519 execution receipts with offline hash-chain checking.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/receiptd" },
  openGraph: {
    title,
    description,
    url: "/receiptd",
    type: "website",
    images: ["/receiptd-banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/receiptd-banner.png"],
  },
};

const demo = "https://sandbox.auditgpt.ai/?scenario=prod-drop-table&step=1";
const repo = "https://github.com/NickAltstein/receiptd";

const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest();
const short = (bytes: Buffer) => bytes.toString("hex").slice(0, 16) + "…";

function generateReceiptPreview() {
  const payload = {
    schema_version: "birkin.receipt@1",
    seq: 42,
    timestamp: "2026-11-10T19:42:01.120Z",
    tool: "postgres.execute_sql",
    decision: "deny",
    rule_matched: "RULE-SQL-01: NO_UNCHECKED_DROP",
    args_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    prev_hash: "a67f082e441c901e18b108842183e271efd36488349281a70519df6c561b0a72",
  };
  const bytes = Buffer.from(JSON.stringify(payload));
  const digest = hash(bytes);
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const signature = sign(null, bytes, privateKey);
  const merkleRoot = hash(Buffer.concat([hash(Buffer.from("audit-block-checkpoint-42")), digest]));

  return {
    rawPayload: JSON.stringify(payload, null, 2),
    digestHex: short(digest),
    fullDigest: digest.toString("hex"),
    signatureHex: short(signature),
    merkleRootHex: short(merkleRoot),
    verified: verify(null, bytes, publicKey, signature),
  };
}

const PRIMITIVES = [
  {
    icon: Lock,
    tag: "PRIMITIVE 01",
    title: "Fail-Closed PreToolUse Hook",
    description:
      "Intercepts tool invocations synchronously inside the agent runtime before any system side-effects occur. Unhandled errors, unparseable arguments, or policy timeouts immediately exit with status code 2.",
  },
  {
    icon: Hash,
    tag: "PRIMITIVE 02",
    title: "Canonical JSON Serialization (sorted keys)",
    description:
      "Strict byte-for-byte serialization standardizes JSON spacing, dictionary key sorting, and IEEE 754 float precision. Prevents semantic whitespace tampering from altering cryptographic hashes.",
  },
  {
    icon: Fingerprint,
    tag: "PRIMITIVE 03",
    title: "Ed25519 Signatures & Hash Chaining",
    description:
      "Every single allow or deny decision produces a digitally signed record bound to the previous event's SHA-256 hash (prev_hash). An attacker cannot remove, reorder, or alter past receipts.",
  },
  {
    icon: ShieldCheck,
    tag: "PRIMITIVE 04",
    title: "Binary Merkle Tree Checkpoints",
    description:
      "Roots are computed every 100 receipts by default (or configurable down to shorter intervals or session close) and recorded to disk. Reviewers or CI jobs verify thousands of tool actions offline.",
  },
  {
    icon: ShieldAlert,
    tag: "PRIMITIVE 05",
    title: "Stop Hook Protection",
    description:
      "Prevents runaway agent retry loops and runaway token drain. Claude Code's Stop hook retries up to 3 times before terminating cleanly with a signed gave_up receipt rather than blocking forever.",
  },
];

export default function ReceiptdPage() {
  const preview = generateReceiptPreview();

  return (
    <div className={styles.site}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.nav}>
          <div className="flex items-center gap-3">
            <Link className={styles.brand} href="/" aria-label="AuditGPT home">
              <span className={styles.mark}>
                <Image src="/logo-shield.png" alt="" width={45} height={45} unoptimized />
              </span>
            </Link>
            <span className="font-mono text-xs font-semibold text-zinc-500 uppercase tracking-widest hidden sm:inline-block">
              / receiptd
            </span>
          </div>
          <nav aria-label="Main navigation">
            <a href="#primitives">Architecture</a>
            <a href="#spec">Receipt Spec</a>
            <a href="#tamper-proof">Offline Checking</a>
            <a href="#trifecta-card">Trifecta Card</a>
            <a href="#limits">Limits</a>
            <a href="#case-study">Case Study</a>
            <a href="#quickstart">Quickstart</a>
            <a className={styles.navCta} href={demo} target="_blank" rel="noopener noreferrer">
              Open Simulator <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className={styles.hero} aria-labelledby="headline">
          <div className={styles.heroGrid}>
            <div className={styles.intro}>
              <div className="flex items-center gap-2 mb-3">
                <p className={styles.label}>
                  <span /> Open-source runtime authorization
                </p>
                <span className="font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                  MIT Licensed
                </span>
              </div>
              <h1 id="headline">
                Enforce tool policy at runtime. <em>Offline hash-chain checking.</em>
              </h1>
              <p className={styles.lead}>
                Receiptd is a fail-closed execution boundary for Claude Code and Model Context
                Protocol (MCP) agents. It intercepts tool calls, evaluates policy in 0.02 ms
                in-process (~78 ms cold hook), halts unauthorized actions with exit code 2, and produces
                tamper-evident Ed25519 receipts.
              </p>
              <div className={styles.actions}>
                <a className={styles.primary} href={demo} target="_blank" rel="noopener noreferrer">
                  Try the blocked-call demo <ArrowUpRight size={18} aria-hidden="true" />
                </a>
                <a className={styles.secondary} href={repo} target="_blank" rel="noopener noreferrer">
                  View Receiptd on GitHub <ArrowRight size={16} aria-hidden="true" />
                </a>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-950 bg-emerald-100/90 border border-emerald-300 px-3 py-2 rounded-lg select-all">
                  pip install receiptd
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-200/80 font-mono text-xs text-zinc-600">
                <span className="font-semibold text-zinc-900">Hook Latency:</span> 0.02 ms in-process · ~78 ms cold hook (77.5 ms mean, 82.4 ms p95)
              </div>

              <ul className={styles.trust} aria-label="Technical capabilities">
                <li>0.02 ms in-process · ~78 ms cold hook</li>
                <li>Fail-closed (exit 2)</li>
                <li>Ed25519 + canonical JSON</li>
                <li>Open Source (MIT)</li>
              </ul>
            </div>

            {/* Live Terminal Preview */}
            <figure className={styles.console}>
              <figcaption>
                <span>
                  <Terminal size={17} aria-hidden="true" /> PreToolUse Interceptor
                </span>
                <span>Active Runtime Gate</span>
              </figcaption>
              <div className={styles.consoleBody}>
                <div className={styles.terminalRow}>
                  <span>JSON-RPC 2.0 · id: req-sql-819</span>
                  <span className={styles.blocked}>
                    <span /> BLOCKED · FAIL CLOSED
                  </span>
                </div>
                <pre className={styles.payload}>
                  <code>{`{
  "jsonrpc": "2.0",
  "id": "req-sql-819",
  "method": "tools/call",
  "params": {
    "name": "postgres.execute_sql",
    "arguments": {
      "query": "`}<strong>DROP TABLE users CASCADE;</strong>{`"
    }
  }
}`}</code>
                </pre>
                <div className={styles.terminalRow}>
                  <span>
                    <Fingerprint size={15} aria-hidden="true" /> Cryptographic Receipt #42
                  </span>
                  <span className={styles.verified}>
                    {preview.verified ? "Signature checks out" : "Signature invalid"}
                  </span>
                </div>
                <dl className={styles.proof}>
                  <div>
                    <dt>Decision SHA-256</dt>
                    <dd>{preview.digestHex}</dd>
                  </div>
                  <div>
                    <dt>Merkle Root</dt>
                    <dd>{preview.merkleRootHex}</dd>
                  </div>
                  <div>
                    <dt>Signature</dt>
                    <dd>{preview.signatureHex}</dd>
                  </div>
                  <div>
                    <dt>Exit Code</dt>
                    <dd className="text-rose-400 font-bold">2 (SIGABRT / Execution Halted)</dd>
                  </div>
                </dl>
              </div>
              <a
                className={styles.consoleCta}
                href={`${demo}&tamper=1`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Change one byte in the simulator <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </figure>
          </div>
        </section>

        {/* Core Architecture */}
        <section id="primitives" className={styles.walkthrough} aria-labelledby="primitives-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.label}>
                <Cpu size={15} aria-hidden="true" /> Core Architecture
              </p>
              <h2 id="primitives-title" className="mt-2">
                Five deterministic security primitives
              </h2>
            </div>
            <a href={repo} target="_blank" rel="noopener noreferrer">
              Inspect Source on GitHub <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {PRIMITIVES.map(({ icon: Icon, tag, title, description }) => (
              <div
                key={tag}
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-semibold text-emerald-800">
                    <span>{tag}</span>
                    <Icon size={18} className="text-emerald-700" />
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-zinc-900 tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Receipt Specification */}
        <section id="spec" className={styles.caseStudy} aria-labelledby="spec-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.label}>
                <FileCode2 size={15} aria-hidden="true" /> Exact Schema
              </p>
              <h2 id="spec-title" className="mt-2">
                The Portable Authorization Receipt
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-500">schema: birkin.receipt@1</span>
          </div>

          <p className="text-sm text-zinc-600 max-w-2xl leading-relaxed mb-6">
            Every decision—whether allowed, denied, or requiring human escalation—produces an immutable
            JSON object canonicalized as sorted-key JSON and signed with Ed25519. Modifying any field breaks
            the cryptographic signature and hash chain.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-[#10231a] border border-[#244b34] rounded-xl overflow-hidden shadow-md">
              <div className="px-4 py-2.5 border-b border-[#32503e] bg-[#0b1a13] flex items-center justify-between font-mono text-xs text-zinc-300">
                <span>receipt_INV_2026_8891.json</span>
                <span className="text-[#9effa9]">✓ Canonical JSON</span>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-100 overflow-x-auto leading-relaxed">
                <code>{preview.rawPayload}</code>
              </pre>
            </div>

            <div className="lg:col-span-5 space-y-3 font-mono text-xs">
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <span className="text-emerald-700 font-bold">seq</span>
                <p className="text-zinc-600 mt-1 font-sans text-xs">
                  Monotonically increasing sequence number that prevents missing receipt omission.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <span className="text-emerald-700 font-bold">args_hash</span>
                <p className="text-zinc-600 mt-1 font-sans text-xs">
                  SHA-256 over canonical JSON arguments. Ensures tool parameters cannot be modified retroactively.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <span className="text-emerald-700 font-bold">prev_hash</span>
                <p className="text-zinc-600 mt-1 font-sans text-xs">
                  SHA-256 digest of the previous receipt, establishing an append-only cryptographic chain.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <span className="text-emerald-700 font-bold">sig</span>
                <p className="text-zinc-600 mt-1 font-sans text-xs">
                  Ed25519 signature over canonical receipt bytes. Offline checking using the exported public key.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Offline Checking & Tamper Detection */}
        <section id="tamper-proof" className={styles.caseStudy} aria-labelledby="tamper-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.label}>
                <FileCheck2 size={15} aria-hidden="true" /> Zero-Trust Audit
              </p>
              <h2 id="tamper-title" className="mt-2">
                Offline Checking &amp; Tamper Detection
              </h2>
            </div>
            <a href={repo} target="_blank" rel="noopener noreferrer">
              receiptd verify CLI <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>

          <p className="text-sm text-zinc-600 max-w-3xl leading-relaxed mb-6">
            Reviewers and compliance auditors don’t need access to production databases or third-party APIs.
            The audit trail is checked completely offline by re-deriving the hash chain and checking signatures.
            Merkle roots anchor checkpoints every 100 receipts by default (or configured down to custom intervals or session close).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valid Run */}
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-5 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                <span className="font-bold text-emerald-900">$ receiptd verify --ledger ./ledger.jsonl</span>
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-semibold">
                  PASS
                </span>
              </div>
              <pre className="mt-3 text-emerald-950 space-y-1 overflow-x-auto">
{`[INFO] Loaded 14 receipts from ledger
[INFO] Verifying SHA-256 hash chain: 14/14 VALID
[INFO] Verifying Ed25519 signatures: 14/14 VALID
[INFO] Validating Merkle anchor: OK (root matches key_dir)
✓ AUDIT COMPLETE: 0 anomalies, 0 tampered records.`}
              </pre>
            </div>

            {/* Tampered Run */}
            <div className="rounded-xl border border-rose-300 bg-rose-50/50 p-5 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-rose-200">
                <span className="font-bold text-rose-900">$ sed -i 's/"deny"/"allow"/' ./ledger.jsonl</span>
                <span className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded text-[11px] font-semibold">
                  FAIL
                </span>
              </div>
              <pre className="mt-3 text-rose-950 space-y-1 overflow-x-auto">
{`$ receiptd verify --ledger ./ledger.jsonl
[FAIL] Seq #42: Hash continuity break!
       Expected prev_hash: a67f082e...
       Computed hash:      e3b0c442...
[FAIL] Seq #42: Ed25519 signature invalid for payload.
✗ AUDIT FAILED: Cryptographic tampering detected at seq 42.`}
              </pre>
            </div>
          </div>
        </section>

        {/* Trifecta Hazard Card */}
        <section id="trifecta-card" className={styles.caseStudy} aria-labelledby="trifecta-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.label}>
                <ShieldCheck size={15} aria-hidden="true" /> Post-Session Audit
              </p>
              <h2 id="trifecta-title" className="mt-2">
                Trifecta Hazard Card
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-500">receiptd card · receiptd verify-card</span>
          </div>

          <p className="text-sm text-zinc-600 max-w-3xl leading-relaxed mb-6">
            <code className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">receiptd card</code> analyzes Claude Code and Codex session logs offline with deterministic rules, answering one question: <em>did this session touch the lethal trifecta of private data + untrusted input + egress?</em>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-mono text-xs">
            <div className="bg-[#10231a] border border-[#244b34] rounded-xl p-5 text-emerald-100 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#32503e] text-zinc-300">
                <span>$ receiptd card --last 1</span>
                <span className="text-[#9effa9]">Signed Card</span>
              </div>
              <pre className="text-xs text-emerald-200 overflow-x-auto leading-relaxed">
{`[CLASSIFY] Analyzed 18 tool calls from session log
[TRIFECTA] Private Data Access:    DETECTED (db.read_secret)
[TRIFECTA] Untrusted Input Parse:  DETECTED (web.fetch)
[TRIFECTA] External Data Egress:    BLOCKED  (curl exfil)
------------------------------------------------------
VERDICT: HAZARD NEUTRALIZED (Exit 0)
Exported signed card: card.json & card.svg`}
              </pre>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
                <h4 className="font-bold font-mono text-zinc-900 text-sm">Deterministic Classification</h4>
                <p className="text-zinc-600 mt-1.5 leading-relaxed">
                  Evaluates tool names, arguments, and hosts against deterministic rule patterns in <code className="font-mono text-[11px] bg-zinc-100 px-1 rounded">rules.yaml</code>. Makes zero external network calls and inspects only tool call metadata, never prompt text.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
                <h4 className="font-bold font-mono text-zinc-900 text-sm">Offline Verification via CLI</h4>
                <p className="text-zinc-600 mt-1.5 leading-relaxed">
                  Check the authenticity of any card with <code className="font-mono text-[11px] bg-zinc-100 px-1 rounded">receiptd verify-card card.json</code>. Re-checks the Ed25519 signature against the developer&apos;s public key.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Limits Section */}
        <section id="limits" className={styles.caseStudy} aria-labelledby="limits-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.label}>
                <ShieldAlert size={15} aria-hidden="true" /> Explicit Scope
              </p>
              <h2 id="limits-title" className="mt-2">
                What Receiptd Does Not Cover
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-500">Honest Boundary Conditions</span>
          </div>

          <p className="text-sm text-zinc-600 max-w-3xl leading-relaxed mb-6">
            Security tools earn trust by clearly defining their operational boundaries. Receiptd is a deterministic gate for configured agent hooks, not an omnipresent operating system sandbox.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
              <div className="font-mono text-xs font-semibold text-rose-800 uppercase tracking-wider">
                01 / Unhooked Execution Paths
              </div>
              <h3 className="text-base font-bold text-zinc-900">Unhooked tools bypass the gate</h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                Receiptd intercepts only actions routed through Claude Code&apos;s PreToolUse lifecycle and configured MCP wrappers. Direct subprocess spawns or tools called outside the hook pipeline are not gated.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
              <div className="font-mono text-xs font-semibold text-rose-800 uppercase tracking-wider">
                02 / Decision vs. Execution
              </div>
              <h3 className="text-base font-bold text-zinc-900">Receipts record decisions, not side effects</h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                A signed receipt proves whether Receiptd permitted or denied the tool invocation. It does not record whether downstream third-party APIs succeeded, failed, or timed out.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
              <div className="font-mono text-xs font-semibold text-rose-800 uppercase tracking-wider">
                03 / Loop Prevention
              </div>
              <h3 className="text-base font-bold text-zinc-900">Stop hook gives up after 3 retries</h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                To avoid locking developer sessions into infinite retry cycles, the Stop hook retries up to 3 times, then exits cleanly with a signed gave_up receipt rather than blocking indefinitely.
              </p>
            </div>
          </div>
        </section>

        {/* Case Study Section */}
        <section id="case-study" className={styles.caseStudy} aria-labelledby="case-study-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.label}>
                <GitPullRequest size={15} aria-hidden="true" /> Reproducible Proof
              </p>
              <h2 id="case-study-title" className="mt-2">
                Synthetic Invoice Review (Case Study)
              </h2>
            </div>
            <a
              href="https://github.com/NickAltstein/receiptd/pull/17"
              target="_blank"
              rel="noopener noreferrer"
            >
              View PR #17 on GitHub <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>

          <InvoiceCaseStudyProof />
        </section>

        {/* Quickstart Section */}
        <section id="quickstart" className={styles.quickstart} aria-labelledby="quickstart-title">
          <div>
            <p className={styles.label}>
              <Terminal size={16} aria-hidden="true" /> Quickstart
            </p>
            <h2 id="quickstart-title">Add Receiptd to your agent in 60s</h2>
            <p>
              Install the lightweight Python package into your local virtualenv or container. Receiptd
              hooks directly into Claude Code&apos;s PreToolUse lifecycle and MCP server pipelines. Open source under the MIT License.
            </p>
            <a href={repo} target="_blank" rel="noopener noreferrer">
              Read the Integration Guide <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className={styles.command}>
            <div>
              <Terminal size={16} aria-hidden="true" /> Setup &amp; Audit Commands
            </div>
            <pre>
              <code>{`# 1. Install Receiptd from PyPI and hook Claude Code
pip install receiptd && receiptd init --claude-code

# 2. Export public key for offline verifiers
receiptd pubkey > ./receiptd.pub

# 3. Check any ledger completely offline
receiptd verify --ledger .receiptd/ledger.jsonl

# 4. Generate signed Trifecta hazard card
receiptd card --last 1`}</code>
            </pre>
          </div>
        </section>

        {/* Design Partner Inquiries */}
        <section className="py-12 border-t border-zinc-200 bg-zinc-50/80">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-3 font-sans">
            <h3 className="text-lg font-bold text-zinc-900">Design Partner Inquiries</h3>
            <p className="text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
              Interested in deploying deterministic tool execution boundaries or cryptographic receipt chains for your enterprise agent workflows?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono pt-2">
              <a href="mailto:contact@auditgpt.ai" className="font-semibold text-emerald-800 hover:underline">
                contact@auditgpt.ai
              </a>
              <span className="text-zinc-300">|</span>
              <span className="text-zinc-700">Nick Altstein</span>
              <span className="text-zinc-300">|</span>
              <a href="https://github.com/NickAltstein/receiptd/issues" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-800 hover:underline">
                GitHub Issues &rarr;
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>Receiptd · Open-Source Runtime Gate under MIT License</span>
        <nav aria-label="Footer navigation">
          <a href={demo} target="_blank" rel="noopener noreferrer">
            Live sandbox <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <Link href="/">AuditGPT</Link>
          <Link href="/receiptd">Receiptd</Link>
          <Link href="/proof">Proof</Link>
          <Link href="/legal">Terms</Link>
          <a href="mailto:contact@auditgpt.ai">Contact</a>
          <a href="#headline">
            Back to top <ArrowDown className={styles.up} size={14} aria-hidden="true" />
          </a>
        </nav>
      </footer>
    </div>
  );
}