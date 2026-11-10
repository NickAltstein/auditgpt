### Role
You are a senior evaluation engineer for Scrutexity.

### Goal
Define automated test cases for the root-cause engine that enforce the evidence rule: every confident classification must include source evidence.

### Files to Read
- `apps/web/lib/distortion-root-cause.ts`
- `validation/README.md`

### Files to Modify
None. Evaluation spec only.

### Do Not Touch
No code changes.

### Acceptance Criteria
- Test cases cover all 8 root-cause categories
- The `unknown` guardrail is tested with weak/conflicting signals
- False confident classifications fail the suite
- The suite is runnable via `npx promptfoo eval`

### Verification Commands
```bash
npx promptfoo eval -c promptfoo/root-cause.evals.yaml
```

### Deliverable
A promptfoo evals configuration file.

### Hard Rules
- Every test case must include an assert for source_evidence
- Tests for `unknown` must assert `confidence: null`
- No test should pass without evidence

### Do Not Build New Product Features
Eval configuration only. No new features.

---
Prompt version: 1.0
Last run:
Outcome:
Improvement notes:
