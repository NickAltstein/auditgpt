### Role
You are a senior QA engineer for Scrutexity.

### Goal
Validate the distortion root-cause engine under real rescans across 20 domains and produce a trust-document JSON report.

### Files to Read
- `apps/web/lib/distortion-root-cause.ts`
- `apps/web/app/api/scan/[id]/route.ts`
- `apps/web/app/api/claims/[claimHash]/timeline/route.ts`
- `apps/web/lib/claim-provenance.ts`
- `validation/example-domains.json`

### Files to Modify
None. This is a read-only validation pass.

### Do Not Touch
No code changes. Report only.

### Acceptance Criteria
- 20 domains scanned and rescanned
- 10+ high-severity distortions analyzed
- 70%+ root causes include source evidence
- 100% weak signals return `unknown` with `null` confidence
- 0 false confident classifications
- 0 timeline access leaks

### Verification Commands
```bash
pnpm validate:batch --input validation/example-domains.json --output validation/batch-1.json
# Wait 24-48h
pnpm validate:batch --input validation/batch-1.json --output validation/batch-1-rescan.json --rescan
pnpm validate:report --batch validation/batch-1.json --rescan validation/batch-1-rescan.json
```

### Deliverable
A JSON validation report following the schema in `validation/README.md`.

### Hard Rules
- Confident classification without evidence = FAIL
- `unknown` with `null` confidence = CORRECT when evidence is weak
- Do not fix bugs, only document them

### Do Not Build New Product Features
Zero code changes. Validation report only.

---
Prompt version: 1.0
Last run:
Outcome:
Improvement notes:
