# Content authoring standard

Every concept lesson in `content/tracks/<track>/concepts/<NN-slug>/` follows
this standard. The content linter enforces the file layout; the verification
harness (`pnpm --filter @fluent/sandbox verify-content [track...]`) enforces
that exemplars actually pass their test suites through the real execution
engine. **No lesson ships unverified.**

## Files per concept

| File | Purpose |
|------|---------|
| `config.json` | `{ slug, title, position, has_testout, status }` — `status` is always `"published"` |
| `instructions.md` | The lesson (structure below) |
| `stub.<ext>` | Starter code the learner edits: signatures + focused TODO comments |
| `exemplar.<ext>` | Reference solution — **must pass both test suites** |
| `<slug>_test.<ext>` | Lesson test suite, run against the learner's code |
| `testout_stub.<ext>` | Only when `has_testout: true` — same task, minimal scaffolding |
| `testout_test.<ext>` | Only when `has_testout: true` — the test-out suite (may be stricter) |

## instructions.md structure

```markdown
# <Concept title>

## What you'll learn
2–4 sentences: the concept, why it matters, what the learner can do afterwards.

## Key concepts
Teach before you task. Short prose + runnable code examples for each idea the
task exercises. A learner who reads only this section should be able to
attempt the task without external resources.

## Watch out                    (optional but encouraged)
The mistakes people actually make: off-by-ones, language gotchas, footguns.

## The task
See the self-containment rule below.
```

DSA lessons additionally include: complexity tables, a **Problem walkthroughs**
section (step-by-step implementation guides for every catalog problem in the
pattern), and interview follow-up questions.

## The task section is self-contained — the platform's hardest rule

Placement and test-out surfaces render **only** the `## The task` section,
without the rest of the lesson. Write it so a competent engineer who has never
seen the lesson can solve it:

- One or two sentences of context first (what is being built and why).
- Every function/deliverable gets: full signature, behavior description,
  **sample inputs and outputs as a code block**, and its edge cases /
  expectations spelled out.
- Never a bare "implement X". If `X` is a term of art (e.g. `compose`),
  define it in place.

The heading must be exactly `## The task` — the platform extracts this
section with a regex.

## Test suites

- Tests exercise the task's stated behavior including the documented edge
  cases — every claim in the task section is backed by at least one test.
- Test output names each check and prints a `N passed, M failed` summary;
  non-zero exit on any failure (see any existing `*_test.*` for the
  per-language harness idiom).
- The lesson suite imports the learner's code from the stub file name
  (`./stub` / `stub` module / linker convention per language) — the sandbox
  writes learner code under that name.

## Test-out (`has_testout: true`)

Test-out poses the **same task** as the lesson — mastery means solving it
without the lesson's scaffolding:

- `testout_stub.<ext>`: bare signatures, no guiding comments.
- `testout_test.<ext>`: at least the lesson suite's coverage; may add
  stricter cases (larger inputs, more edge cases).
- The lesson exemplar must pass the testout suite too (the harness checks).

## Track curriculum

A track's 10+ concepts form a deliberate progression: each concept names in
its intro what it builds on. Order concepts so that every task is solvable
with only current-and-earlier concepts plus the language's obvious basics.
