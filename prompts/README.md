# Scrutexity PromptOps

PromptOps is a structured prompt authoring and feedback-loop system for
the Scrutexity project. Every prompt sent to Codex, Claude, or GLM
follows the `PROMPTING_STANDARD.md` template and is tracked in `loops/`.

## Directory Structure

```
prompts/
├── PROMPTING_STANDARD.md   # 10 mandatory sections + authoring workflow
├── prompt-loop.sh          # POSIX feedback-loop automation
├── loop-template.md        # Pre-filled loop log template
├── README.md               # This file
├── codex/                  # Prompts for Codex (release engineering)
├── claude/                 # Prompts for Claude (strategy, copy)
├── glm/                    # Prompts for GLM (build sprints)
├── evals/                  # Prompt evaluation rules and test cases
└── loops/                  # Loop log files (YYYY-MM-DD-<name>.md)
```

## Workflow

1. **Author** a prompt in the appropriate subdirectory following `PROMPTING_STANDARD.md`
2. **Check** it: `./prompt-loop.sh <name> --check`
3. **Send** to the agent
4. **Create** a loop log: `./prompt-loop.sh <name>`
5. On agent response, **commit** the outcome: `./prompt-loop.sh <name> --commit`

## Commands

| Command | Purpose |
|---------|---------|
| `./prompt-loop.sh <name>` | Create a pre-filled loop log |
| `./prompt-loop.sh <name> --check` | Verify all 10 sections are present |
| `./prompt-loop.sh <name> --commit` | Append outcome to the most recent log |
| `./prompt-loop.sh --help` | Print usage |

## Prompt Categories

| Directory | Agent | Purpose |
|-----------|-------|---------|
| `codex/` | Codex (OpenAI) | Release-blocker fixes, validation tooling, deployment |
| `claude/` | Claude (Anthropic) | Business strategy, site copy, GTM audits |
| `glm/` | GLM (Google) | Build sprints, schema design, infrastructure |
| `evals/` | All | Evaluation rules and test case definitions |
