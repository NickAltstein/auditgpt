#!/bin/sh
# prompt-loop.sh — POSIX feedback-loop automation for Scrutexity PromptOps
# Usage:
#   ./prompt-loop.sh <prompt-name>          Create a pre-filled loop log
#   ./prompt-loop.sh <prompt-name> --commit  Append outcome to most recent log
#   ./prompt-loop.sh <prompt-name> --check   Verify all 10 sections exist
#   ./prompt-loop.sh --help                  Print usage

set -e

PROMPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
LOOPS_DIR="$PROMPTS_DIR/loops"
STANDARD="$PROMPTS_DIR/PROMPTING_STANDARD.md"
TEMPLATE="$PROMPTS_DIR/loop-template.md"

usage() {
  echo "Usage: $0 <prompt-name> [--commit|--check|--help]"
  echo ""
  echo "Commands:"
  echo "  <name>          Create a pre-filled log in loops/YYYY-MM-DD-<name>.md"
  echo "  <name> --commit Append dated outcome to most recent log"
  echo "  <name> --check  Verify all 10 sections are present"
  echo "  --help          Print this help"
  exit 0
}

[ "$#" -eq 0 ] && usage
[ "$1" = "--help" ] && usage

NAME="$1"
ACTION="${2:-}"
DATE=$(date +%Y-%m-%d)

# Find the prompt file
PROMPT_FILE=""
for dir in codex claude glm evals; do
  candidate="$PROMPTS_DIR/$dir/$NAME.md"
  [ -f "$candidate" ] && PROMPT_FILE="$candidate" && break
done
[ -z "$PROMPT_FILE" ] && [ -f "$PROMPTS_DIR/$NAME.md" ] && PROMPT_FILE="$PROMPTS_DIR/$NAME.md"

if [ -z "$PROMPT_FILE" ] && [ "$ACTION" != "--commit" ]; then
  echo "Error: Prompt '$NAME' not found in codex/, claude/, glm/, evals/, or prompts/ root."
  exit 1
fi

# ── Create ────────────────────────────────────────────────────
if [ -z "$ACTION" ]; then
  mkdir -p "$LOOPS_DIR"
  LOG="$LOOPS_DIR/${DATE}-${NAME}.md"

  # Handle same-day collisions
  if [ -f "$LOG" ]; then
    n=2
    while [ -f "${LOOPS_DIR}/${DATE}-${NAME}-${n}.md" ]; do n=$((n + 1)); done
    LOG="${LOOPS_DIR}/${DATE}-${NAME}-${n}.md"
  fi

  if [ -f "$TEMPLATE" ]; then
    cp "$TEMPLATE" "$LOG"
  else
    echo "# Loop Log: $NAME" > "$LOG"
    echo "Date: $DATE" >> "$LOG"
    echo "" >> "$LOG"
    echo "## Prompt" >> "$LOG"
    echo "" >> "$LOG"
    echo "## Outcome" >> "$LOG"
    echo "" >> "$LOG"
    echo "## Next Action" >> "$LOG"
  fi

  # Pre-fill prompt content if available
  if [ -n "$PROMPT_FILE" ]; then
    echo "" >> "$LOG"
    echo "---" >> "$LOG"
    echo "Prompt source: $PROMPT_FILE" >> "$LOG"
    cat "$PROMPT_FILE" >> "$LOG"
  fi

  echo "Created: $LOG"
  exit 0
fi

# ── Check ─────────────────────────────────────────────────────
if [ "$ACTION" = "--check" ]; then
  if [ -z "$PROMPT_FILE" ]; then
    echo "FAIL: Prompt file not found."
    exit 1
  fi

  MISSING=0
  for section in "Role" "Goal" "Files to Read" "Files to Modify" "Do Not Touch" \
                 "Acceptance Criteria" "Verification Commands" "Deliverable" \
                 "Hard Rules" "Do Not Build New Product Features"; do
    if ! grep -q "^###.*$section" "$PROMPT_FILE" && ! grep -q "^##.*$section" "$PROMPT_FILE"; then
      echo "MISSING: $section"
      MISSING=$((MISSING + 1))
    fi
  done

  # Check footer
  if ! grep -q "Prompt version:" "$PROMPT_FILE"; then
    echo "MISSING: Prompt version footer"
    MISSING=$((MISSING + 1))
  fi

  if [ $MISSING -gt 0 ]; then
    echo "FAIL: $MISSING section(s) missing."
    exit 1
  fi
  echo "PASS: All 10 sections + footer present."
  exit 0
fi

# ── Commit ────────────────────────────────────────────────────
if [ "$ACTION" = "--commit" ]; then
  # Find the most recent log for this prompt
  LATEST_LOG=""
  for f in "$LOOPS_DIR/${DATE}-${NAME}.md" "$LOOPS_DIR/${DATE}-${NAME}-"*.md; do
    [ -f "$f" ] && LATEST_LOG="$f"
  done

  if [ -z "$LATEST_LOG" ]; then
    echo "Error: No log found for '$NAME' on $DATE. Run '$0 $NAME' first."
    exit 1
  fi

  # Append run history entry
  echo "" >> "$LATEST_LOG"
  echo "## Run History" >> "$LATEST_LOG"
  echo "" >> "$LATEST_LOG"
  echo "### $(date '+%Y-%m-%d %H:%M')" >> "$LATEST_LOG"
  echo "**Outcome:** $(grep '^Outcome:' "$LATEST_LOG" | tail -1 | sed 's/Outcome: //')" >> "$LATEST_LOG"
  echo "**Next action:** $(grep '^Next action:' "$LATEST_LOG" | tail -1 | sed 's/Next action: //')" >> "$LATEST_LOG"

  # Update footer
  if grep -q "^Last run:" "$LATEST_LOG"; then
    sed -i '' "s/^Last run:.*/Last run: $(date '+%Y-%m-%d')/" "$LATEST_LOG"
  else
    echo "" >> "$LATEST_LOG"
    echo "---" >> "$LATEST_LOG"
    echo "Last run: $(date '+%Y-%m-%d')" >> "$LATEST_LOG"
  fi

  echo "Committed to: $LATEST_LOG"
  exit 0
fi

echo "Error: Unknown action '$ACTION'"
exit 1
