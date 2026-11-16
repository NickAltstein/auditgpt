### Role
You are a senior evaluation engineer for Scrutexity.

### Goal
Define test cases for the false-confident-classification rule: the engine must never return a confident classification (`confidence >= 0.6`, `root_cause != "unknown"`) without source evidence.

### Files to Read
- `apps/web/lib/distortion-root-cause.ts`
- `prompts/evals/root-cause-evidence-rules.md`

### Files to Modify
None. Evaluation spec only.

### Do Not Touch
No code changes.

### Acceptance Criteria
- Test case with weak website claims and empty external sources returns `unknown`
- Test case with generic AI response and no matching source returns `unknown`
- Test case with confident classification but empty evidence array fails

### Verification Commands
```bash
npx promptfoo eval -c promptfoo/root-cause.evals.yaml
```

### Deliverable
Additional test cases for the promptfoo evals configuration.

### Hard Rules
- Empty or generic `source_evidence` with a confident classification = FAIL
- The correct response for weak signals is `unknown` with `null` confidence

### Do Not Build New Product Features
Eval configuration only.

---
Prompt version: 1.0
Last run:
Outcome:
Improvement notes:
