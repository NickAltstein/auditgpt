# Loop Log: {{name}}
Date: {{date}}

## Prompt

(Paste prompt content or reference prompt file)

## Outcome

success / failure / blocked

## Next Action

(What to do next based on outcome)

---

Prompt source: {{source}}

---
Prompt source: /Users/nick/Projects/scrutexity/prompts/codex/validation-tooling.md
### Role
You are a senior validation engineer for Scrutexity.

### Goal
Build CLI tooling to run the 20-domain validation batch against the scan API and generate a root-cause validation report.

### Files to Read
- `validation/example-domains.json`
- `validation/smoke-domain.json`
- `scripts/run-validation-batch.ts`
- `apps/web/app/api/scan/route.ts`
- `apps/web/lib/distortion-root-cause.ts`

### Files to Modify
- `scripts/run-validation-batch.ts`
- `scripts/generate-validation-report.ts`
- `validation/README.md`

### Do Not Touch
- `apps/web/lib/claim-provenance.ts`
- `apps/web/lib/ai-distortion.ts`
- `supabase/schema.sql`
- `DESIGN.md`
- `prompts/`

### Acceptance Criteria
- `pnpm validate:batch --input validation/smoke-domain.json --base-url https://api.auditgpt.ai --admin-key $KEY --out validation/smoke-batch.json` runs without error
- Output file contains `scan_id`, `domain`, `status`
- `pnpm validate:report --batch validation/batch-1.json --rescan validation/batch-1-rescan.json` produces a valid JSON report

### Verification Commands
```bash
npx tsc --noEmit scripts/run-validation-batch.ts scripts/generate-validation-report.ts
pnpm validate:batch --help
pnpm validate:report --help
```

### Deliverable
Working validation CLI tooling. Typecheck passes.

### Hard Rules
- Do not change any production code
- Do not touch schema or migrations
- Default to mock mode where live API is unavailable

### Do Not Build New Product Features
This is validation infrastructure only. No new features, no UI, no dashboards.

---
Prompt version: 1.0
Last run:
Outcome:
Improvement notes:
