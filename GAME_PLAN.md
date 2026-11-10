# Scrutexity — Game Plan

## Elevator Pitch

Scrutexity is a **Claim Intelligence Infrastructure** company. We use compliance
as the ingestion wedge to build a timestamped, hash-chained record of public
marketing claims and AI-attributed statements across the highest-enforcement
vertical in America: GLP-1, med-spa, and weight-loss marketing.

The scanner at auditgpt.ai is a **data acquisition engine**. Every free scan
feeds the Claim Graph — a proprietary vector database of claims, enforcement
patterns, and AI distortions. The $1,497/mo Guardian subscription is the
simplest recurring wrapper around the real product: the graph, the feed, and
the timestamped log.

---

## Architecture

### Layer 1 — The Data Vacuum

| Surface | Purpose | Status |
|---------|---------|--------|
| `auditgpt.ai` | Free public scanner — URL in, claim preview out | ✅ Live (scrutexity-next) |
| `api.auditgpt.ai` | Scan API + Claim Graph ingestion | ✅ Built, blocked on env vars |
| Crawler (Railway/Render) | Headless browser for page extraction | ✅ Built, deploy pending |

### Layer 2 — The Monetization Engine

| Product | Price | Audience |
|---------|-------|----------|
| Free Claim Snapshot | $0 | Top-of-funnel |
| Claim Exposure Audit | $497 one-time | First paid touch; credited toward Guardian |
| Guardian Monitoring | From $1,497/mo | Continuous monitoring, AI distortion alerts |
| Enterprise | From $4,997/mo | Multi-site, API access, claim foundation |
| Data Licensing | Custom | Law firms, insurers, hedge funds |

### Layer 3 — The Moat

| Asset | Description | Status |
|-------|-------------|--------|
| **Claim Provenance Engine** | GitHub for public claims — tracks first_seen → changed → fixed lifecycle | ✅ Built, validated |
| **Distortion Root-Cause Engine** | Classifies *why* AI distorted a claim (8 categories, 60% confidence threshold) | ✅ Built, validated synthetically |
| **Distortion Census** | Public, hash-chained, timestamped record of what AI models say about 500+ brands | 🚧 Requires validation data |
| **Ad Decay Feed** | Weekly public feed of live GLP-1 ads matching FDA warning letter patterns | 🚧 Post-validation build |
| **Competitor Mirror** | Competitor claim counts embedded in every paid receipt | ✅ Built, integrated |

### Layer 4 — Distribution

| Asset | Description | Status |
|-------|-------------|--------|
| Competitor Mirror | Embeds competitor claim counts into every paid receipt | ✅ Built |
| Agency Watch Alerts | Automated notifications for watched advertisers | 🚧 Post-validation |
| No Record Default | Observatory where absence of a review record is the signal | 🚧 Post-validation |

### Layer 5 — Execution

| Asset | Description | Status |
|-------|-------------|--------|
| **PromptOps** | Version-controlled library of 8 battle-tested agent prompts with feedback loop | ✅ Built |
| **Hermes** | Operational intelligence agent tracking scans + MRR | ✅ Active |
| **Validation Tooling** | CLI for 20-domain rescan validation | ✅ Built |

### Layer 6 — Pre-Flight

| Product | Price | Surface |
|---------|-------|---------|
| Account Audit (one-time) | $997 | API sweep of live ad account |
| Pre-Flight (per account) | $499/mo | API pre-flight + Chrome extension |
| Agency tier | $2,499/mo | White-label, pooled checks |
| Guardian bundle | $1,797/mo | Pre-Flight + site monitoring |

Pre-Flight is a month-3+ motion, funded by the direct engine. The account audit
slots into the existing sales machine immediately — it's the same scanner pointed
at Ad Library instead of a homepage.

The rejection-forensics loop — every disapproved ad your flags predicted — builds
a private model of Meta's health-ad enforcement. After 12 months across 10+
agency accounts, this dataset is more valuable than the SaaS revenue.

| Surface | Description |
|---------|-------------|
| 1 — API pre-flight | Draft creative → claim extraction → dual-corpus match (enforcement + platform policy) → CRT-formatted Pre-Flight Record |
| 2 — Meta Marketing API | Agency-authorized: pre-submission checks, account audit, rejection forensics |
| 3 — Ads Manager companion | Chrome extension showing flags inline in Ads Manager |

### Layer 7 — Open Standard (CRT)

| Asset | Status |
|-------|--------|
| Claim Record Transparency spec (v0.9) | 🔒 Strategy folder — Q2 release |
| CRC verification procedure | 🔒 Strategy folder — Q2 release |
| Conformance test kit | 🔒 Waits for first law firm payment |
| CRT-ready receipt pipeline | ✅ Live — every receipt includes CRT fields |

### Layer 8 — Consumer Trust Extension (ClaimCheck)

| Detail | Value |
|--------|-------|
| Name | ClaimCheck by Scrutexity |
| Model | B2B pressure instrument that consumers use for free |
| Chrome Web Store | One listing, two modes (consumer free, agency paid) |
| Monetization | $0 to consumers, no affiliate revenue, no pay-to-play |
| Revenue driver | Clinics converting to Guardian to change what the extension says |
| Kill criterion | Month-6: <15k installs or <25% WAUs → cap at maintenance |

The extension shows three tiers of information for every clinic checked:
1. **Census panel** — observed claims, pattern-match counts, AI distortion findings
2. **Record status** — "Review Record: Active" or "No record on file" (with honest framing)
3. **One action** — "Get alerted if this clinic's status changes" (email capture)

Growth model:
- Months 1–3: Research-moment installs (5k target) — Reddit, census SEO CTAs
- Months 3–6: Creator wave (25k target) — Dr. Idz, Lab Muffin, Dr. Nadolsky
- Months 6–12: Utility retention + status-change events (100k ceiling)

The extension's job is not 100,000 users. Its job is to make "what does the
extension say about us?" a question med-spa owners ask each other. At 12k
highly-targeted GLP-1 researchers, the play pays for itself in outreach
conversion alone. At 100k, it's the moat's public face.

---

### Layer 9 — The Claim Risk Bureau (36-month endgame)

Scrutexity is not a compliance tool. It is the **claim risk bureau** — the entity
that observes regulated claims (records), prices their risk (score), and
prevents bad ones from being generated (guardrail). Observe → price → prevent
is the same loop Verisk, FICO, and the credit bureaus run.

**The thesis:** Marketing-claim liability is becoming an insurable risk class
with no loss data. Three forces converged — AI collapsed generation cost,
enforcement industrialized (14 → 43 FDA letters), and the insurance industry
prices this risk with a checkbox: *"Do you review your advertising claims?
☐ Yes ☐ No."* The first entity to assemble the reference dataset becomes its
bureau.

**The window:** open now because 2026's letter tranches created enough outcome
events to backtest against. Closing in 18–24 months when an insurtech or Verisk
notices. Their disadvantage: the Wayback Machine is sparse and has no claim
extraction. Yours compounds daily.

**Three revenue streams, each >$20M at endgame:**

| Stream | Shape | Example |
|--------|-------|---------|
| Records | Vanta — continuous record layer | Guardian, embed, Pre-Flight, accreditation |
| Risk Bureau | Verisk — per-submission score lookups | $75–150/lookup, program licenses at $50–100k/yr |
| Guardrail | Generation-side API prevention | $0.005/check in AI marketing tools |

**The retro-validation study (the unlock, weeks 1–4 after validation report):**
Take every 2025–26 FDA/FTC letter recipient, score their archived pre-letter
observations, compare against non-letter controls. Output: *"Domains in the top
score decile were Nx more likely to receive a letter within 12 months."*
If N ≥ 3, proceed to Score v1. If weak, reweight features (distortion
persistence, remediation latency). If still weak, the records/embed/guardrail
businesses stand without the score.

**The rewrite corpus (hidden asset):** Every audit produces a (flagged claim →
human-reviewed rewrite → survival outcome) pair. This is RLHF-grade guardrail
training data for AI marketing platforms (Writer, Jasper, Typeface). Instrument
it as a `rewrite_pairs` table tracking survival at 30/90 days. Don't build the
Guardrail API yet — just collect the data.

**Valuation math:** $8–12M ARR at month 36 with a retro-validated score and one
contributory carrier program supports $100–200M valuation at 10–20x.
Data-bureau businesses with contributory moats trade like software.

**Pricing ladder (expanded):**

| Product | Price | Buyer |
|---------|-------|-------|
| Claim Snapshot | $0 | Top-of-funnel |
| Claim Exposure Audit | $497 one-time | First paid touch |
| Account Audit (one-time) | $997 | Ad account sweep |
| Pre-Flight (per account) | $499/mo | Agency pre-submission |
| Guardian Monitoring | From $1,497/mo | Continuous monitoring |
| Guardian + Pre-Flight bundle | $1,797/mo | Combined |
| Agency tier | $2,499/mo | White-label, pooled |
| Enterprise | From $4,997/mo+ | Multi-site, API |
| Retro-study license | $25k | Carrier/program |
| Per-submission score lookup | $95 | Carrier underwriting |
| Program license | $50k/yr + $2/policy | Carrier program |
| Guardrail platform min | $5k/mo + $0.005/check | AI marketing tools |
| Dataset license (non-exclusive) | $250k/yr | AI platform fine-tuning |
| Data licensing (funds/firms) | $60–90k/yr | Named-entity feed |

**The one operating sentence that replaces everything before it:**

> Scrutexity observes public claims before outcomes, validates them against
> enforcement events, and turns the resulting archive into the risk layer
> insurers, acquirers, platforms, and AI tools use to price and prevent
> claim liability.

---

### Vertical Expansion Map (Q3 2026+)

Shelf-inventory until the gate passes and first payment exists. Ranked by Fable 5:

| Rank | Vertical | Why | Time to $1 | Guardian fit |
|------|----------|-----|------------|--------------|
| 1 | **Hormone therapy / TRT / peptides** | Hottest enforcement outside GLP-1 — FDA Category 2 bans, "research use only" letters, FTC anti-aging fines. AI distortion structurally identical to GLP-1 (compounded/approved confusion). 70% corpus overlap — biote.com, hormonehealthcenter.com already in validation set. | Days | $497→$1,497, cash-pay clinics |
| 2 | **Addiction treatment / rehab marketing** | Highest-stakes AI distortion (misstating accreditation to desperate families). FTC v. Evoke Wellness ($1.9M). Best deal size (rehab CAC $5-15k, $1,497/mo rounding error). | 60-90 days | Strong — but pattern corpus needs building |
| 3 | **Supplement brands (DTC/Amazon)** | Highest raw enforcement volume. FDA disease-claim letters + FTC Health Products Guidance + fake-review rule = three pattern corpora. Thousands of scannable domains. | ~2 weeks | Weak below $5M revenue — volume play |

**Non-GLP-1 weight loss** = free inventory, not an expansion (existing 24 patterns cover it).
**Mental health telehealth** = passes on budget, fails on criterion 4 (they have compliance teams now).

---

## The Uncopyable Moat

> "When these model versions are deprecated, our log becomes the only permanent
> record these statements ever existed."

The Claim Graph grows more valuable over time because:
1. **Model deprecation** — AI model versions are replaced quarterly. Our logs of
   what GPT-4o, Claude, and Gemini said about specific brands in 2026 are
   unrecoverable after those model versions are deprecated.
2. **Hash-chained records** — Every observation is timestamped and verifiable
   against a public digest. No competitor can fabricate historical data.
3. **Provenance timeline** — Every claim's full lifecycle (first seen, changed,
   fixed, distorted, rewritten) is tracked. Competitors starting in 2028 cannot
   recreate 2026 data.
4. **Enforcement proximity** — Pattern matches tied to specific FDA/FTC
   enforcement actions. Each new warning letter increases the graph's relevance.

---

## Data Licensing Framework

### Products

| Product | Contents | Anonymization | Buyers |
|---------|----------|---------------|--------|
| **A. Vertical Benchmark** | Aggregate stats: pattern-match prevalence, distortion rates, deltas | Full | Insurers, trade pubs |
| **B. Named-Entity Feed** | Per-domain: quoted claims, pattern matches, distortion observations | None | Funds, law firms, PE |
| **C. Entity Workup** | One-brand deep exhibit: claim history, distortion exhibit, timeline | None | Law firms, acquirers |

### Pricing

| Buyer | Product | Pilot | Full |
|-------|---------|-------|------|
| Hedge funds | B + event alerts | $3,000/mo, 3-month | $60–90k/yr |
| Insurers/MGAs | A + per-submission lookup | $15k one-time study | $30–50k/yr |
| Law firms | C + quarterly brief | $500 brief; $2.5k workup | $25k/yr firm-wide |
| Trade pubs | A, co-branded | Free with attribution | $10–15k sponsorship |

### Legal Rails

1. **Public-source provenance** — every record is a quoted public statement,
   fair summary of a public document, or a recorded output we generated.
2. **FCRA firewall** — contractually prohibit use in consumer decisions.
3. **Model-provider ToS** — sell *observations of* what AI stated, not raw outputs.
4. **No-advice clause** — not legal, medical, investment, or underwriting advice.
5. **Hash verification** — every record independently verifiable against public digest.

---

## Buyers & Sequencing

### Order of Operations

| Phase | Buyer | Asset | Timeline |
|-------|-------|-------|----------|
| 1 | Trade pubs (AmSpa) | Free vertical benchmark | Weeks 1–4 |
| 2 | Law firms | $500 briefs, $2.5k workups | Weeks 2–6 (first cash) |
| 3 | Insurers (CFC, Beazley) | $15k carrier study | Weeks 4–12 |
| 4 | Hedge funds (via Neudata) | Named-entity feed | Month 3+ |

### Why This Order

- **AmSpa first** = industry association credential. Funds, law firms, and
  insurers see the citation before they ever talk to us.
- **Law firms second** = fastest closing cycle. Revenue validates data value
  before slower buyers enter.
- **Insurers third** = legitimizes the underwriting narrative. One carrier deal
  is the reference a16z asks for.
- **Funds last** = 3–6 month diligence cycles. They arrive pre-educated by
  AmSpa citation + carrier study.

---

## The Gate

Everything above is built and ready. The only thing holding it back is a live
Supabase instance connected to the Vercel project.

**The unlock sequence:**

1. Set env vars in `scrutexity-api` Vercel dashboard
2. `supabase db push` — apply all 7 migrations
3. `pnpm tsx scripts/seed-patterns.ts` — seed enforcement patterns
4. Run smoke test against `api.auditgpt.ai/api/scan`
5. Run 20-domain validation batch
6. Wait 24–48h for rescan window
7. Generate validation report

After that sequence, every layer of the architecture produces real artifacts
from real data. The machine is live.

---

## Metrics That Matter

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Scans in Claim Graph | 1,000 by July 15 | 0 | 🔴 CRIICAL — env blocked |
| Guardian MRR | $7,485 (5 customers) by July 31 | $0 | 🔴 CRITICAL — env blocked |
| Validation report | 20 domains rescanned | Not started | 🔴 CRITICAL — env blocked |

All three metrics unlock with the same action: set env vars → deploy → smoke
test. Everything else is downstream.
