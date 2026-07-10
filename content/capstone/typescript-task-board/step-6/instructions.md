# Step 6 — GET /board

The final ticket: a board summary view, the kind of endpoint a UI would
call to render three columns (todo / in progress / done) in one request.
The fixtures for this step seed enough tasks across all three statuses to
exercise the grouping.

## Key concept: typed grouping

Fetch every task with a single `SELECT * FROM tasks`, then group the rows
in code rather than issuing three separate queries. A `Record` keyed by
`TaskStatus` gives you a typed accumulator:

```ts
const columns: Record<TaskStatus, Task[]> = {
  todo: [],
  in_progress: [],
  done: [],
};

for (const task of allTasks) {
  columns[task.status].push(task);
}
```

Because `columns` is typed as `Record<TaskStatus, Task[]>`, there's no
way to end up with a stray fourth column or a typo'd key — TypeScript
requires all three to be initialized up front.

## The task

Add a handler for `GET /board` that returns every task grouped by status,
plus a count per column.

**Response:** `200 OK` with:

```json
{
  "todo": [
    { "id": 2, "title": "...", "status": "todo", "assignee": "...", "created_at": "..." }
  ],
  "in_progress": [
    { "id": 3, "title": "...", "status": "in_progress", "assignee": "...", "created_at": "..." }
  ],
  "done": [
    { "id": 1, "title": "...", "status": "done", "assignee": "...", "created_at": "..." }
  ],
  "counts": { "todo": 1, "in_progress": 1, "done": 1 }
}
```

Requirements:

- Use a single `SELECT * FROM tasks` query, then group the resulting
  rows into the three columns in your TypeScript code — do not issue a
  separate query per status.
- Each of `"todo"`, `"in_progress"`, and `"done"` is an array of full
  task objects (even if empty).
- `"counts"` reports the length of each column as a JSON number — derive
  it from the grouped arrays (`columns.todo.length`, etc.), not a second
  round-trip to the database.
