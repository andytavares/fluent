#!/usr/bin/env bash
# Pre-push code review gate — runs Google-style code review via Claude before
# any `git push`. Blocks the push (exit 2) if the review verdict is NEEDS WORK.
set -euo pipefail

# ── 1. Check if this Bash call is a git push ────────────────────────────────
tool_input=$(cat)
cmd=$(python3 -c "
import sys, json
try:
    d = json.loads(sys.argv[1])
    print(d.get('command', ''))
except Exception:
    print('')
" "$tool_input" 2>/dev/null || echo "")

if ! printf '%s' "$cmd" | grep -qE 'git\s+push'; then
  exit 0
fi

echo "" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "  Google Code Review — pre-push gate" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

# ── 2. Collect the diff to review ───────────────────────────────────────────
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD")
upstream=$(git for-each-ref --format='%(upstream:short)' \
           "$(git symbolic-ref -q HEAD 2>/dev/null)" 2>/dev/null || echo "")

if [ -n "$upstream" ]; then
  diff_content=$(git diff "$upstream"...HEAD 2>/dev/null || echo "")
  commit_log=$(git log --oneline "$upstream"..HEAD 2>/dev/null || echo "")
else
  # No upstream yet — review the last commit
  diff_content=$(git diff HEAD~1 2>/dev/null || echo "")
  commit_log=$(git log --oneline -1 2>/dev/null || echo "")
fi

if [ -z "$diff_content" ]; then
  echo "No unpushed changes found — skipping review." >&2
  exit 0
fi

echo "" >&2
echo "Commits in this push:" >&2
echo "$commit_log" >&2
echo "" >&2
echo "Running review..." >&2

# ── 3. Run the review ────────────────────────────────────────────────────────
prompt="You are a code reviewer following Google's engineering practices.

Review the diff below. Examine: design, functionality, complexity, tests,
naming, comments, style, and documentation.

Core standard: Approve if the change improves overall code health, even if
not perfect. Use Nit: for non-blocking suggestions, Optional: for
considerations, and no label for required changes.

End your review with EXACTLY one of these two lines (no variation):
  VERDICT: LGTM
  VERDICT: NEEDS WORK

If NEEDS WORK, list the specific required changes the author must address.

Commits being pushed:
$commit_log

Diff:
$diff_content"

review=$(claude -p "$prompt" 2>/dev/null)

echo "" >&2
echo "$review" >&2
echo "" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

# ── 4. Gate on verdict ───────────────────────────────────────────────────────
if printf '%s' "$review" | grep -q "VERDICT: LGTM"; then
  echo "✓ Review passed — proceeding with push." >&2
  exit 0
else
  echo "✗ Push blocked — address the required changes above, then push again." >&2
  echo "  To bypass in an emergency: git push --no-verify" >&2
  exit 2
fi
