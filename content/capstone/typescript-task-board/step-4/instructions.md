# Step 4 — PATCH /tasks/:id/status

This is the core of the board: tasks move through a fixed workflow, and
the API is the only thing enforcing it. Unlike Step 2's validation (is
this a known status?), this step validates a *transition* (is it legal to
move from the task's current status to this one?).

## Key concept: the transition map as a typed `Record`

Encode the allowed transitions as a lookup table keyed by every
`TaskStatus`, so TypeScript forces you to account for all three states —
forget one and the object literal won't satisfy the `Record` type:

```ts
const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ["in_progress"],
  in_progress: ["done"],
  done: [],
};

function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
```

This makes "no skipping, no going back" a single table lookup instead of
a chain of `if` statements — and the table itself documents the entire
workflow at a glance.

## The task

Add a handler for `PATCH /tasks/:id/status` that transitions a task to a
new status.

**Request body:**

```json
{ "status": "in_progress" }
```

**Response:** `200 OK` with the full updated row on a legal transition:

```json
{
  "id": 1,
  "title": "Write launch checklist",
  "status": "in_progress",
  "assignee": "Priya",
  "created_at": "2026-07-01T09:00:00.000Z"
}
```

Requirements:

- Legal transitions are exactly: `todo` → `in_progress`, and
  `in_progress` → `done`. No other transition is allowed — not skipping
  a state (`todo` → `done`), and not reversing one (`in_progress` →
  `todo`, `done` → `in_progress`).
- If the requested `status` is not one of the three known values, return
  `400 Bad Request` with body:

  ```json
  { "error": "invalid status", "allowed": ["todo", "in_progress", "done"] }
  ```

- If `status` is a known value but the transition from the task's
  current status isn't allowed, return `409 Conflict` with body:

  ```json
  { "error": "invalid transition", "from": "todo", "to": "done" }
  ```

  where `"from"` is the task's current status and `"to"` is the
  requested one.
- Return `404 Not Found` with body `{"error": "not found"}` if no task
  with that id exists.
- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
