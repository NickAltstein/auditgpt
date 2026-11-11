import { createHash, generateKeyPairSync, sign, verify } from "node:crypto";
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUpRight, Braces, Fingerprint, ShieldCheck, Terminal } from "lucide-react";
import { CopyCommand } from "./copy-command";
import { InvoiceCaseStudyProof } from "@/components/InvoiceCaseStudyProof";
import styles from "./homepage.module.css";

const demo = "https://sandbox.auditgpt.ai/?scenario=prod-drop-table&step=1";
const source = "https://github.com/NickAltstein/receiptd";
const cli = "https://www.npmjs.com/package/auditgpt";
const title = "AuditGPT | AI agent testing and tool authorization";
const description = "Test agent workflows in CI with AuditGPT. Use Receiptd to enforce tool policy and verify signed decisions offline.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", type: "website", images: ["/logo-full.png"] },
  twitter: { card: "summary_large_image", title, description, images: ["/logo-full.png"] },
};

const sandbox = "https://sandbox.auditgpt.ai/";
const tamper = demo + "&tamper=1";
const loop = sandbox + "?scenario=recursive-subagent-fork&step=1";
const injection = sandbox + "?scenario=poisoned-pr&step=2";
const classes = [
  { code: "LOOP", title: "Infinite loops", detail: "Retry cascades and stalled execution.", href: loop, action: "Open loop demo" },
  { code: "TOOL", title: "Destructive tool calls", detail: "Tool permissions and destructive mutations.", href: demo, action: "Open blocked call" },
  { code: "STAT", title: "Context drift", detail: "Constraints lost across multi-turn runs.", href: "#quickstart", action: "Run the CLI" },
  { code: "SECR", title: "Prompt injection", detail: "Instructions embedded in untrusted content.", href: injection, action: "Open injection demo" },
  { code: "ECON", title: "Runaway token spend", detail: "Worker fan-out and repeated inference.", href: loop, action: "Open spend demo" },
];

const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest();
const short = (bytes: Buffer) => bytes.toString("hex").slice(0, 16) + "…";

function exampleReceipt() {
  const bytes = Buffer.from(JSON.stringify({ decision: "DENY", request_id: "req-202", tool: "postgres.execute_sql" }));
  const digest = hash(bytes);
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const signature = sign(null, bytes, privateKey);
  const root = hash(Buffer.concat([hash(Buffer.from("synthetic-policy-event")), digest]));
  return { digest: short(digest), signature: short(signature), root: short(root), verified: verify(null, bytes, publicKey, signature) };
}

const steps = [
  { icon: Braces, title: "Inspect the blocked call", detail: "See the requested database operation and the policy rules it matched." },
  { icon: ShieldCheck, title: "Verify the receipt", detail: "Check the Ed25519 signature on the original decision payload." },
  { icon: Fingerprint, title: "Change one byte", detail: "Alter the payload in the simulator and watch verification fail." },
];

export default function Home() {
  const receipt = exampleReceipt();
  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <div className={styles.nav}>
          <a className={styles.brand} href="/" aria-label="AuditGPT home">
            <span className={styles.mark}>
              <Image src="/logo-shield.png" alt="" width={45} height={45} unoptimized />
            </span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#failure-classes">5 Failure Classes</a>
            <a href="#walkthrough">Interactive Simulator</a>
            <a href="#case-study">Case Study</a>
            <a href="#quickstart">CI/CD SARIF Gate</a>
            <a className={styles.navCta} href={demo}>Open Simulator <ArrowUpRight size={14} aria-hidden="true" /></a>
          </nav>
        </div>
      </header>
      <main>
        <section className={styles.hero} aria-labelledby="headline">
          <div className={styles.heroGrid}>
            <div className={styles.intro}>
              <p className={styles.label}><span /> Open-source agent security</p>
              <h1 id="headline">Test AI agents before deployment. <em>Enforce tool policy at runtime.</em></h1>
              <p className={styles.lead}>AuditGPT tests agent workflows across five failure classes and reports findings in CI. Receiptd checks tool calls routed through its hooks and records signed decisions you can verify offline.</p>
              <div className={styles.actions}>
                <a className={styles.primary} href={demo}>Try the blocked-call demo <ArrowUpRight size={18} aria-hidden="true" /></a>
                <a className={styles.secondary} href={source}>View Receiptd on GitHub <ArrowRight size={16} aria-hidden="true" /></a>
                <CopyCommand />
              </div>
              <ul className={styles.trust} aria-label="Technical capabilities">
                <li>Fail-closed hook</li><li>Ed25519 receipts</li>
                <li>Local CLI / CI runner</li><li>MIT-licensed CLI</li>
              </ul>
            </div>
            <figure className={styles.console}>
              <figcaption><span><Terminal size={17} aria-hidden="true" /> Tool-call interceptor</span><span>Synthetic preview</span></figcaption>
              <div className={styles.consoleBody}>
                <div className={styles.terminalRow}>
                  <span>JSON-RPC 2.0 · req-202</span>
                  <span className={styles.blocked}><span /> BLOCKED · FAIL CLOSED</span>
                </div>
                <pre className={styles.payload}><code>{'{\n  "jsonrpc": "2.0",\n  "id": "req-202",\n  "method": "tools/call",\n  "params": {\n    "name": "postgres.execute_sql",\n    "arguments": {\n      "query": "'}<strong>DROP TABLE [redacted]</strong>{'"\n    }\n  }\n}'}</code></pre>
                <div className={styles.terminalRow}>
                  <span><Fingerprint size={15} aria-hidden="true" /> Example decision receipt</span>
                  <span className={styles.verified}>{receipt.verified ? "Ed25519 verified" : "Verification failed"}</span>
                </div>
                <dl className={styles.proof}>
                  <div><dt>Decision SHA-256</dt><dd>{receipt.digest}</dd></div>
                  <div><dt>Example Merkle root</dt><dd>{receipt.root}</dd></div>
                  <div><dt>Signature</dt><dd>{receipt.signature}</dd></div>
                </dl>
              </div>
              <a className={styles.consoleCta} href={tamper}>Change one byte in the simulator <ArrowUpRight size={17} aria-hidden="true" /></a>
            </figure>
          </div>
        </section>
        <section id="failure-classes" className={styles.matrix} aria-labelledby="failure-classes-title">
          <div className={styles.sectionHeading}><h2 id="failure-classes-title">Five failure classes</h2></div>
          <ul className={styles.classGrid}>
            {classes.map(({ code, title, detail, href, action }) => (
              <li key={code}><a href={href}>
                <span className={styles.classCode}>{code}</span>
                <h3>{title}</h3><p>{detail}</p>
                <span className={styles.classLink}>{action} <ArrowRight size={14} aria-hidden="true" /></span>
              </a></li>
            ))}
          </ul>
        </section>
        <section id="walkthrough" className={styles.walkthrough} aria-labelledby="walkthrough-title">
          <div className={styles.sectionHeading}>
            <h2 id="walkthrough-title">Walk through a blocked call</h2>
            <a href={demo}>Open simulator <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
          <ol className={styles.steps}>
            {steps.map(({ icon: Icon, title, detail }) => (
              <li key={title}><Icon size={23} aria-hidden="true" /><h3>{title}</h3><p>{detail}</p></li>
            ))}
          </ol>
        </section>
        <section id="case-study" className={styles.caseStudy} aria-labelledby="case-study-title">
          <div className={styles.sectionHeading}>
            <h2 id="case-study-title">Verified case study</h2>
            <a href="https://github.com/NickAltstein/receiptd/pull/17" target="_blank" rel="noopener noreferrer">
              View PR #17 on GitHub <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <InvoiceCaseStudyProof />
        </section>
        <section id="quickstart" className={styles.quickstart} aria-labelledby="quickstart-title">
          <div>
            <p className={styles.label}><Terminal size={16} aria-hidden="true" /> AuditGPT CLI</p>
            <h2 id="quickstart-title">Run an agent test in CI</h2>
            <p>Point AuditGPT at your local test agent. The free CLI can run in your CI workflow and fail a required check. Export SARIF for code scanning. Tests send requests to the endpoint you configure.</p>
            <a href={cli}>Read the CLI docs <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
          <div className={styles.command}>
            <div><Terminal size={16} aria-hidden="true" /> Example command</div>
            <pre><code>{[
              "npx auditgpt test",
              "  --endpoint http://localhost:8000/agent/v1",
              "  --ci --export-sarif audit_results.sarif",
            ].join(" " + String.fromCharCode(92) + "\n")}</code></pre>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>AuditGPT.ai · MIT-licensed CLI</span>
        <nav aria-label="Footer navigation">
          <a href={demo}>Live sandbox <ArrowUpRight size={14} aria-hidden="true" /></a>
          <a href="/proof">Proof</a>
          <a href="/legal">Terms</a>
          <a href="mailto:contact@auditgpt.ai">Contact</a>
          <a href="#headline">Back to top <ArrowDown className={styles.up} size={14} aria-hidden="true" /></a>
        </nav>
      </footer>
    </div>
  );
}
