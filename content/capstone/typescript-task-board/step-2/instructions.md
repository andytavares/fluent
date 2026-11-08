# Step 2 — POST /tasks

Step 1 gave you a running server. This step adds persistence: the
`tasks` table and the first write path. Every later step reads or
changes the rows that this endpoint creates.

## Key concept: modeling status as a union type

A Postgres `CHECK` constraint enforces the set of valid statuses. Your
TypeScript code must also know that set, at compile time. Model it as a
string literal union, not a bare `string`:

```ts
type TaskStatus =
  | "todo"
  | "in_progress"
  | "done";

const VALID_STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "done",
];

function isTaskStatus(
  value: unknown,
): value is TaskStatus {
  return (
    typeof value === "string" &&
    (VALID_STATUSES as string[])
      .includes(value)
  );
}
```

Every function that touches the status of a task must accept or return
`TaskStatus`, not `string`. Examples are creating a task and changing
its status (Step 4). Then an invalid status is a compile error where
you write it directly. Values from the network can become a
`TaskStatus` only through a type guard, such as `isTaskStatus` above.

## The task

Add a handler for `POST /tasks`. It creates a task and stores it in
Postgres.

**Request body:**

```json
{
  "title": "Write launch checklist",
  "assignee": "Priya"
}
```

`status` is optional on create. When it is missing, it is `"todo"`:

**Response:** `201 Created` with the inserted row:

```json
{
  "id": 1,
  "title": "Write launch checklist",
  "status": "todo",
  "assignee": "Priya",
  "created_at": "2026-07-08T12:00:00.000Z"
}
```

Requirements:

- Connect to Postgres with the `DATABASE_URL` environment variable. Your
  session already sets it. Use the `pg` package. It is the only
  third-party package in your session, and the session has no network
  access to get another one.

```ts
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
});
```

- Your server must create the `tasks` table on startup if it does not
  exist:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN
      ('todo', 'in_progress', 'done')),
  assignee TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Run this statement once with `pool.query(...)` before
  `server.listen(8080)`.

- The request must have `title`. If it is missing, or it is not a non-empty
  string, return `400 Bad Request`.
- `assignee` is optional. If you leave it out or send `null`, the stored
  value is SQL `NULL`. SQL `NULL` becomes JSON `null`.
- `status` is optional. If it is missing, the inserted row gets
  `"todo"`. If it is present, it must be `"todo"`, `"in_progress"` or
  `"done"`. Any other value returns `400 Bad Request` with this body:

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

- `node:http` gives you the raw request stream, so read and parse the
  body yourself:

```ts
function readBody(
  req: IncomingMessage,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}
```
