# Scrutexity PromptOps — Prompting Standard

## Purpose

Every prompt sent to an AI agent (Claude, GLM, Codex) follows this standard.
It ensures consistency, traceability, and prevents speculative builds.

## 10 Mandatory Sections

### 1. Role
Define the agent's persona explicitly.
> *Example: You are a senior release engineer for Scrutexity.*

### 2. Goal
One sentence describing what success looks like.
> *Example: Make `auditgpt.ai/api/scan` return live JSON.*

### 3. Files to Read (minimum)
List every file the agent must read before modifying anything.
> *Example: apps/web/app/api/scan/route.ts*

### 4. Files to Modify
List every file the agent is permitted to change.
> *Example: apps/web/lib/ollama-embed.ts (create)*

### 5. Do Not Touch
Explicitly list what is off-limits.
> *Example: Do not change DESIGN.md. Do not touch schema.sql. Do not add new features.*

### 6. Acceptance Criteria
Concrete, testable pass/fail conditions.
> *Example: curl -X POST https://api.auditgpt.ai/api/scan returns scan_id*

### 7. Verification Commands
Exact commands to run before declaring done.
> *Example: npx tsc --noEmit -p apps/web/tsconfig.json*

### 8. Deliverable
What the agent produces.
> *Example: A JSON validation report. Not a strategy memo.*

### 9. Hard Rules
Non-negotiable constraints.
> *Example: Confident classification without evidence = FAIL. Never say "compliant" or "certified."*

### 10. "Do Not Build New Product Features"
Explicit instruction to prevent scope creep.
> *Example: Do not suggest new features. Do not redesign. Only fix the blocker.*

## Footer

Every prompt file ends with:

```
Prompt version: 1.0
Last run: YYYY-MM-DD
Outcome: success / failure / blocked
Improvement notes:
```

## Authoring Workflow

1. Copy `loop-template.md` into `prompts/loops/YYYY-MM-DD-<name>.md`
2. Fill all 10 sections
3. Run `./prompt-loop.sh <name> --check`
4. Send to agent
5. On response, run `./prompt-loop.sh <name> --commit` to log outcome
