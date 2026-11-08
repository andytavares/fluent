# Step 6 — GET /board

This is the final ticket: a board summary view. A UI calls this kind of
endpoint to show three columns (todo, in progress, done) with one
request. The fixtures for this step contain tasks in all three statuses,
so the grouping has rows to work on.

## Key concept: typed grouping

Fetch every task with one `SELECT * FROM tasks`. Then group the rows in
code. Do not send three separate queries. A `Record` with a key for each
`TaskStatus` gives you a typed accumulator:

```ts
const columns: Record<
  TaskStatus,
  Task[]
> = {
  todo: [],
  in_progress: [],
  done: [],
};

for (const task of allTasks) {
  columns[task.status].push(task);
}
```

`columns` has the type `Record<TaskStatus, Task[]>`, so it cannot get an
extra fourth column or a key with a typo. TypeScript makes you start all
three columns at the beginning.

## The task

Add a handler for `GET /board`. It returns every task grouped by status,
and a count for each column.

**Response:** `200 OK` with:

```json
{
  "todo": [
    {
      "id": 2,
      "title": "...",
      "status": "todo",
      "assignee": "...",
      "created_at": "..."
    }
  ],
  "in_progress": [
    {
      "id": 3,
      "title": "...",
      "status": "in_progress",
      "assignee": "...",
      "created_at": "..."
    }
  ],
  "done": [
    {
      "id": 1,
      "title": "...",
      "status": "done",
      "assignee": "...",
      "created_at": "..."
    }
  ],
  "counts": {
    "todo": 1,
    "in_progress": 1,
    "done": 1
  }
}
```

Requirements:

- Use one `SELECT * FROM tasks` query. Then group the rows into the three
  columns in your TypeScript code. Do not send a separate query for each
  status.
- Each of `"todo"`, `"in_progress"` and `"done"` is an array of full task
  objects, also when it is empty.
- `"counts"` gives the length of each column as a JSON number. Compute
  it from the grouped arrays (`columns.todo.length` and so on). Do not
  query the database a second time.
