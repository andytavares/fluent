# Content authoring standard

Every concept in `content/tracks/<track>/concepts/<NN-slug>/` and every
capstone step in `content/capstone/<project>/step-N/` follows this standard.
Three checks hold it:

- Vale checks the prose of every `instructions.md` (`vale content/`).
- The content linter checks the files and the lesson structure.
- `pnpm --filter @fluent/sandbox verify-content [track...]` runs each exemplar
  against its tests in the real execution engine.

No lesson ships until all three exit 0.

## Files per concept

| File | Purpose |
|------|---------|
| `config.json` | `{ slug, title, position, has_testout, status }`. `status` is always `"published"`. |
| `instructions.md` | The lesson, in the structure below. |
| `stub.<ext>` | The starter code the learner edits: signatures and short TODO comments. |
| `exemplar.<ext>` | The reference solution. It must pass both test suites. |
| `<slug>_test.<ext>` | The lesson test suite. It runs against the learner's code. |
| `testout_stub.<ext>` | Only when `has_testout: true`. The same task, with bare signatures. |
| `testout_test.<ext>` | Only when `has_testout: true`. The test-out suite. It can be stricter. |

## Lesson structure

```markdown
## What you build
One to three sentences. Name the result of the task.
End with: This lesson builds on **<earlier concept title>**.

## Key concepts
### <One idea per heading, stated as a fact>
One to three sentences, then one example.

## Watch out
- One mistake per bullet: the mistake, then its result.

## The task
One or two sentences of context.
Numbered rules, one behavior per sentence.
Edge cases in words.
One example block: each call and its result.
```

- Do not start with a `#` title. The page header shows the concept title.
- Concept 1 of a track names no earlier concept.
- The heading must be exactly `## The task`. The platform extracts that
  section with a regular expression.
- DSA lessons keep their extra sections: complexity tables, problem
  walkthroughs and interview follow-ups. The same writing rules apply.

## The task stands alone

Test-out and placement show only `## The task`. A competent engineer who
never saw the lesson must be able to solve it.

- Start with one or two sentences: what the learner builds and why.
- Give each function its full signature and its behavior.
- State every edge case in words.
- Show sample inputs and outputs in one code block.
- Never write a bare "implement X". Define a term of art where you use it.

## Writing rules

1. Descriptive sentences have 25 words at most. Sentences in
   `## The task` and `## Watch out` have 20 words at most.
2. Use the active voice and the present tense. Write to "you", or use the
   imperative.
3. Use "can" or "must". Do not use `should`, `might` or `may`, unless the
   uncertainty is the fact.
4. Use one term for one thing. Use these terms: track, concept, lesson,
   task, test-out, placement, capstone, step, stub, exemplar.
5. Every line in an example code block fits in 43 characters. Put a long
   comment on its own line above the code. A literal value that a test
   requires is the only exception.
6. Every claim in the task has a test. Every example in the task block
   matches a test case.
7. Check every version-specific claim (for example, "Go 1.22 or later")
   against the official documentation.
8. Compare with other tools in one sentence at most, inside a key concept.
   Do not add a separate comparison section.

The lesson panel is 384 px wide. Short sentences and narrow code are what
make a lesson readable there.

## Test suites

- Tests check the behavior the task states, including each edge case.
- Test output names each check and prints a `N passed, M failed` summary.
  The suite exits non-zero on any failure. Copy the harness idiom from an
  existing `*_test.*` file in the same language.
- The lesson suite imports the learner's code from the stub file name. The
  sandbox writes learner code under that name.

## Test-out (`has_testout: true`)

Test-out poses the same task as the lesson, without the lesson.

- `testout_stub.<ext>` has bare signatures and no guiding comments.
- `testout_test.<ext>` covers at least what the lesson suite covers. It can
  add larger inputs and more edge cases.
- The lesson exemplar must pass the test-out suite too.

## Track curriculum

A track's concepts form a progression. Each concept names the concept it
builds on in `## What you build`. Every task must be solvable with the
current concept, the earlier concepts and the language's basics.
