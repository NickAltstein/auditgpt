### Role
You are a senior release engineer for Scrutexity.

### Goal
Fix the deployment blocker preventing `auditgpt.ai/api/scan` from returning live JSON.

### Files to Read
- `apps/web/app/api/scan/route.ts`
- `apps/web/middleware.ts`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/next.config.ts`

### Files to Modify
As needed to resolve the blocker. No new features.

### Do Not Touch
- `DESIGN.md`
- `supabase/schema.sql`
- `supabase/migrations/`
- `validation/`
- `prompts/`

### Acceptance Criteria
- `curl -X POST https://api.auditgpt.ai/api/scan -H "x-internal-admin-key: $KEY" -d '{"url":"https://henrymeds.com"}'` returns JSON with `scan_id`
- `npx tsc --noEmit -p apps/web/tsconfig.json` passes
- `pnpm --filter web build` passes

### Verification Commands
```bash
npx tsc --noEmit -p apps/web/tsconfig.json
pnpm --filter web build
curl -X POST https://api.auditgpt.ai/api/scan \
  -H "x-internal-admin-key: $KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://henrymeds.com"}'
```

### Deliverable
A working `/api/scan` endpoint that returns JSON. Not a new feature. Not a refactor.

### Hard Rules
- Do not change the scan pipeline logic
- Do not change the schema
- Do not add new dependencies
- Do not remove existing auth guards

### Do Not Build New Product Features
This is a release-blocker repair, not a feature sprint. Fix the deployment, nothing else.

---
Prompt version: 1.0
Last run:
Outcome:
Improvement notes:
