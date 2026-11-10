# Scrutexity Root-Cause Validation Suite

This directory contains the tooling for validating the Distortion Root-Cause Engine
under real rescans across 20 domains. The output is a signed trust document —
the validation report — that proves the engine works under real conditions.

## Workflow

### 1. Prepare

Replace the placeholder domains in `example-domains.json` with your real test set.
The template has 20 domains in 4 buckets:

| Bucket | Count |
|--------|-------|
| GLP-1 / weight loss | 5 |
| Med spa / injectables / body contouring | 5 |
| IV / hormone / wellness | 5 |
| Clean controls (low-risk) | 5 |

### 2. Run first scan

```bash
pnpm tsx scripts/run-validation-batch.ts \
  --input validation/example-domains.json \
  --base-url https://auditgpt.ai \
  --admin-key $INTERNAL_ADMIN_KEY \
  --out validation/validation-batch-1.json
```

Or via the convenience script:

```bash
pnpm validate:batch
```

### 3. Wait 24–48 hours

The rescan must happen at least 24 hours after the first scan to test:
- `seen` events for unchanged claims
- `changed` events for modified claims
- `missing_once` / `fixed_pending_confirmation` / `fixed` events
- Root-cause stability across time

### 4. Rescan

```bash
pnpm tsx scripts/run-validation-batch.ts \
  --input validation/validation-batch-1.json \
  --base-url https://auditgpt.ai \
  --admin-key $INTERNAL_ADMIN_KEY \
  --out validation/validation-batch-1-rescan.json \
  --rescan
```

### 5. Generate report

```bash
pnpm tsx scripts/generate-validation-report.ts \
  --batch validation/validation-batch-1.json \
  --rescan validation/validation-batch-1-rescan.json \
  --base-url https://auditgpt.ai \
  --auth-cookie "$AUTH_COOKIE" \
  --unauth-cookie "$WRONG_USER_OR_EMPTY_COOKIE" \
  --out validation/root-cause-validation-report.json \
  --run-typecheck --run-build
```

Or via the convenience script:

```bash
pnpm validate:report
```

## Pass/Fail Semantics

### Pass conditions

| Metric | Required |
|--------|----------|
| Domains scanned | 20 |
| Domains rescanned | 20 |
| High/critical distortions analyzed | 10+ |
| Root causes with evidence | 70%+ |
| Unknown when weak | 100% |
| False confident classifications | 0 |
| Timeline access leaks | 0 |
| Typecheck | Pass |
| Production build | Pass |

### Fail conditions

- **False confident classification**: confidence >= 0.6, root_cause != unknown,
  but source_evidence is empty or generic. This is the trust boundary violation.
- **Timeline leak**: Unauthorized request returns 200 instead of 403.
- **Blocker**: Less than 20 domains scanned or rescanned.

### Why "unknown" is a success

The most important pass condition is that weak/conflicting evidence returns:

```json
{
  "root_cause": "unknown",
  "confidence": null,
  "action": "Manual review recommended."
}
```

An engine that always returns a confident classification is lying. Returning
`unknown` when evidence is weak proves the engine is trustworthy.

## Output Files

| File | Description |
|------|-------------|
| `validation/example-domains.json` | Template with 20 placeholder domains |
| `validation/validation-batch-1.json` | First scan results (generated) |
| `validation/validation-batch-1-rescan.json` | Rescan results (generated) |
| `validation/root-cause-validation-report.json` | Final validation report (generated) |

Generated files are gitignored. Templates and README remain tracked.

## Hard Rules

1. Confident classification without source evidence = FAIL.
2. Timeline accessible without authorization = FAIL.
3. Less than 20 domains = BLOCKER (report still written).
4. "unknown" with null confidence = CORRECT when evidence is weak.
