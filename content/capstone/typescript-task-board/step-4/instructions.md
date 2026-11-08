# Step 4 — PATCH /tasks/:id/status

This step is the core of the board. Tasks move through a fixed
workflow, and only the API enforces it. Step 2 checks that a status is
known. This step checks a *transition*: can the task move from its
current status to the new one?

## Key concept: the transition map as a typed `Record`

Put the allowed transitions in a lookup table with a key for every
`TaskStatus`. Then TypeScript makes you cover all three states. If you
forget one, the object literal does not satisfy the `Record` type:

```ts
const ALLOWED_TRANSITIONS: Record<
  TaskStatus,
  TaskStatus[]
> = {
  todo: ["in_progress"],
  in_progress: ["done"],
  done: [],
};

function canTransition(
  from: TaskStatus,
  to: TaskStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from]
    .includes(to);
}
```

"No skipping, no going back" is now one table lookup, not a chain of
`if` statements. The table also shows the whole workflow in one place.

## The task

Add a handler for `PATCH /tasks/:id/status`. It moves a task to a new
status.

**Request body:**

```json
{ "status": "in_progress" }
```

**Response:** on a legal transition, `200 OK` with the full updated row:

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

- The only legal transitions are `todo` → `in_progress` and
  `in_progress` → `done`. The API rejects every other transition. A request
  cannot skip a state (`todo` → `done`). It cannot go back either
  (`in_progress` → `todo`, `done` → `in_progress`).
- If the requested `status` is not one of the three known values, return
  `400 Bad Request` with this body:

```json
{
  "error": "invalid status",
  "allowed": [
    "todo",
    "in_progress",
    "done"
  ]
}
```

- If `status` is a known value but the task cannot move to it from its
  current status, return `409 Conflict` with this body:

```json
{
  "error": "invalid transition",
  "from": "todo",
  "to": "done"
}
```

- `"from"` is the current status of the task. `"to"` is the requested
  status.
- If no task has that id, return `404 Not Found` with body
  `{"error": "not found"}`.
- Parse the path segment as an integer. If it is not numeric, return
  `400 Bad Request`.
