# Quickstart Validation Guide: Fluent Platform — v1

**Phase**: 1 | **Date**: 2026-06-19 | **Plan**: [plan.md](./plan.md)

This guide contains runnable validation scenarios that prove the platform works end-to-end. Each scenario maps to one or more spec success criteria. These are validation commands, not a full development setup guide — see `apps/*/README.md` for service-specific setup.

---

## Prerequisites

- Docker + Docker Compose
- Go 1.22+
- Node 20+ + pnpm 9+
- `kubectl` configured against a local cluster (e.g., kind, k3d)
- Judge0 CE running locally (see `infra/judge0/README.md`)
- `psql` (PostgreSQL client)
- `curl` + `jq`

**Environment setup**:

```bash
cp .env.example .env.local   # fill in AUTH_SECRET, AUTH_GITHUB_ID/SECRET, JUDGE0_URL
pnpm install                 # install all workspace dependencies (use pnpm, not npm)
pnpm --filter @fluent/api db:migrate   # run database migrations
pnpm build --filter @fluent/ui         # build @fluent/ui design system
```

**Start the stack**:

```bash
docker compose up -d         # PostgreSQL :5432, Redis :6379, Judge0 :2358, Temporal :7233
pnpm dev                     # all services via Turborepo (web :3000, api :3001, sandbox :3002)
```

Service ports:
- `apps/web` → http://localhost:3000 (Next.js learner UI)
- `apps/api` → http://localhost:3001 (Fastify + tRPC)
- `apps/sandbox` → http://localhost:3002 (BullMQ execution worker)
- Temporal UI → http://localhost:8080

---

## Scenario 1 — Placement & Adaptive Path (US1, SC-002)

Validates that a learner who passes placement tasks has those concepts pre-marked mastered before they open any lesson.

```bash
# 1. Register a new learner
TOKEN=$(curl -s -X POST http://localhost:3001/trpc/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"hunter2","display_name":"Test"}' \
  | jq -r '.token')

# 2. Enroll in the Go track
ENROLLMENT_ID=$(curl -s -X POST http://localhost:3001/trpc/enrollments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"track_slug":"go"}' | jq -r '.enrollment_id')

# 3. Start placement
PLACEMENT_ID=$(curl -s -X POST http://localhost:3001/trpc/placement/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"enrollment_id\":\"$ENROLLMENT_ID\"}" | jq -r '.placement_id')

# 4. Submit a passing solution for task 1 (variables-and-types)
curl -s -X POST "http://localhost:3001/trpc/placement/$PLACEMENT_ID/tasks/1/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"package main\n\nfunc Solve() int { return 42 }\n"}'

# 5. Verify the concept is now mastered
curl -s "http://localhost:3001/trpc/enrollments/$ENROLLMENT_ID/concepts" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.concepts[] | select(.slug=="variables-and-types") | {state, achieved_via}'
# Expected: {"state": "mastered", "achieved_via": "placement"}

# 6. Verify next concept is now available (not locked)
curl -s "http://localhost:3001/trpc/enrollments/$ENROLLMENT_ID/concepts" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.concepts[] | select(.slug=="functions-and-errors") | .state'
# Expected: "available"
```

**SC-002 baseline**: After placement, at least 3 concepts should be testable as mastered given a senior Go engineer's solution set.

---

## Scenario 2 — Lesson REPL: Run & Submit (US2, SC-004)

Validates sandbox execution latency and test suite gating.

```bash
# 1. Open a lesson (transitions to in_progress)
curl -s "http://localhost:3001/trpc/enrollments/$ENROLLMENT_ID/concepts/functions-and-errors" \
  -H "Authorization: Bearer $TOKEN" | jq .state
# Expected: "in_progress"

# 2. Run code and measure latency
START=$(date +%s%3N)
SUBMISSION=$(curl -s -X POST http://localhost:3001/trpc/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"enrollment_id\": \"$ENROLLMENT_ID\",
    \"concept_slug\": \"functions-and-errors\",
    \"submission_type\": \"run\",
    \"code\": \"package main\nimport \\\"fmt\\\"\nfunc main() { fmt.Println(\\\"hello\\\") }\"
  }")
STREAM_URL=$(echo "$SUBMISSION" | jq -r '.stream_url')

# 3. Stream output and time to first result
curl -s -N "http://localhost:3001$STREAM_URL" | while IFS= read -r line; do
  echo "$line"
  if echo "$line" | grep -q '"exit_code"'; then
    END=$(date +%s%3N)
    echo "Latency: $((END - START))ms"  # Must be < 5000ms for SC-004
    break
  fi
done
```

**SC-004 gate**: 95% of runs must complete within 5,000ms under 100 concurrent learners.

---

## Scenario 3 — Test-Out Flow (US3)

Validates the full test-out state transition: pass → mastered, fail → in_progress lesson.

```bash
# 1. Start test-out for an available concept
CHALLENGE=$(curl -s -X POST http://localhost:3001/trpc/testout/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"enrollment_id\":\"$ENROLLMENT_ID\",\"concept_slug\":\"functions-and-errors\"}")
CHALLENGE_ID=$(echo "$CHALLENGE" | jq -r '.challenge_id')

echo "Timer expires at: $(echo "$CHALLENGE" | jq -r '.expires_at')"

# 2a. Submit a passing solution
RESULT=$(curl -s -X POST "http://localhost:3001/trpc/testout/$CHALLENGE_ID/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"package main\n\nfunc Divide(a, b float64) (float64, error) {\n\tif b == 0 { return 0, fmt.Errorf(\"division by zero\") }\n\treturn a / b, nil\n}"}')

# Wait for stream result then check state
sleep 2
curl -s "http://localhost:3001/trpc/enrollments/$ENROLLMENT_ID/concepts" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.concepts[] | select(.slug=="functions-and-errors") | {state, achieved_via}'
# Expected on pass: {"state": "mastered", "achieved_via": "test_out"}
# Expected on fail: {"state": "in_progress", "achieved_via": null}
```

---

## Scenario 4 — Capstone: Provision & Verify Step (US5, SC-005)

Validates ephemeral DB provisioning and HTTP step verification latency.

```bash
# 1. Provision capstone session
SESSION=$(curl -s -X POST "http://localhost:3001/trpc/capstone/go/sessions" \
  -H "Authorization: Bearer $TOKEN")
SESSION_ID=$(echo "$SESSION" | jq -r '.session_id')
POLL_URL=$(echo "$SESSION" | jq -r '.poll_url')

# 2. Poll until DB is connected
for i in $(seq 1 30); do
  STATUS=$(curl -s "http://localhost:3001$POLL_URL" -H "Authorization: Bearer $TOKEN" | jq -r '.db_status')
  echo "[$i] db_status: $STATUS"
  [ "$STATUS" = "connected" ] && break
  sleep 1
done
# Must reach "connected" within 30 seconds

# 3. Submit step 1 code and verify
START=$(date +%s%3N)
VERIFICATION=$(curl -s -X POST \
  "http://localhost:3001/trpc/capstone/sessions/$SESSION_ID/steps/1/verify" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code_snapshot":"...step 1 solution..."}')
VERIFY_STREAM=$(echo "$VERIFICATION" | jq -r '.stream_url')

curl -s -N "http://localhost:3001$VERIFY_STREAM" | while IFS= read -r line; do
  echo "$line"
  if echo "$line" | grep -q '"step_completed"'; then
    END=$(date +%s%3N)
    echo "Verification latency: $((END - START))ms"  # Must be < 30000ms for SC-005
    break
  fi
done
```

---

## Scenario 5 — Content Linter CI Gate (US8, SC-008)

Validates that a new exercise PR passes the CI linter.

```bash
# 1. Create a new concept folder (with all required files)
mkdir -p content/tracks/go/concepts/11-generics/.meta
cat > content/tracks/go/concepts/11-generics/.meta/config.json <<'EOF'
{
  "slug": "generics",
  "title": "Generics",
  "description": "Write type-parameterized functions and data structures",
  "blurb": "vs your language: Go generics use type constraints, not inheritance",
  "status": "active",
  "has_testout": true,
  "difficulty": "medium"
}
EOF
# ... create stub.go, exemplar.go, generics_test.go, testout_stub.go, testout_test.go ...

# 2. Run the linter
go run ./tools/content-linter/cmd/linter ./content/tracks/go/concepts/11-generics
# Expected: EXIT 0, no E00x errors

# 3. Verify linter catches a broken exemplar
# (temporarily break exemplar.go to return wrong type)
go run ./tools/content-linter/cmd/linter ./content/tracks/go/concepts/11-generics
# Expected: EXIT 1, error E004: exemplar does not pass its own test suite
```

---

## Scenario 6 — Rate Limiting (FR-016a)

Validates the per-learner submission rate limit.

```bash
# Fire 11 rapid submissions (limit is 10/60s)
for i in $(seq 1 11); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST http://localhost:3001/trpc/submissions \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"enrollment_id\":\"$ENROLLMENT_ID\",\"concept_slug\":\"variables-and-types\",\"submission_type\":\"run\",\"code\":\"package main\\nfunc main() {}\"}")
  echo "Request $i: HTTP $STATUS"
done
# Expected: requests 1-10 return 202, request 11 returns 429
```

---

## Scenario 7 — Dashboard & Profile Stats (US6, US7)

Validates that the dashboard accurately reflects progress after completing/testing-out of concepts.

```bash
# After running scenarios 1-3 above:
curl -s "http://localhost:3001/trpc/users/me/dashboard" \
  -H "Authorization: Bearer $TOKEN" | jq '{
    concepts_tested_out: .stats.concepts_tested_out,
    time_saved_ms: .stats.time_saved_ms,
    capstone_progress_pct: .stats.capstone_progress_pct
  }'
# Expected: concepts_tested_out >= 1, time_saved_ms > 0
```

---

## Scenario 8 — Concurrent Load (SC-011)

Validates that 100 concurrent learners do not degrade p95 run latency.

```bash
# Requires: k6 (https://k6.io/)
k6 run tests/load/concurrent-runs.js \
  --env BASE_URL=http://localhost:3001 \
  --vus 100 \
  --duration 120s
# Expected: p95 < 5000ms (run output latency), error rate < 1%
# k6 script at: tests/load/concurrent-runs.js
```

---

## Scenario 9 — Accessibility Audit (SC-009)

```bash
# Requires: @axe-core/cli
npx @axe-core/cli http://localhost:3000 \
  http://localhost:3000/tracks/go \
  http://localhost:3000/tracks/go/concepts/variables-and-types \
  --exit
# Expected: 0 WCAG AA violations
```
