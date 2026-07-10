# Step 2 — POST /tasks

With the server up from Step 1, it's time to add persistence. This step
introduces the `tasks` table and the first write path the rest of the
capstone builds on — every later step reads or mutates rows this endpoint
creates.

## Key concept: modeling status as a union type

Postgres enforces the set of valid statuses with a `CHECK` constraint, but
your TypeScript code should know that set too, at compile time. Model it
as a string literal union instead of a bare `string`:

```ts
type TaskStatus = "todo" | "in_progress" | "done";

const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && (VALID_STATUSES as string[]).includes(value);
}
```

Every function that touches a task's status — creating one, transitioning
one (Step 4) — should accept or return `TaskStatus`, not `string`. That's
what makes an invalid status a compile error anywhere you construct one
directly, and a type guard (like `isTaskStatus` above) the only path for
values coming from the wire.

## The task

Add a handler for `POST /tasks` that creates a task and persists it in
Postgres.

**Request body:**

```json
{ "title": "Write launch checklist", "assignee": "Priya" }
```

`status` is optional on create and defaults to `"todo"`:

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

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session), via the `pg` package (pre-fetched into
  your session — no other third-party package is available, and there's
  no network access to fetch one per redeploy):

  ```ts
  import { Pool } from "pg";

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  ```

- Your server should create the `tasks` table itself on startup if it
  doesn't already exist:

  ```sql
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo'
      CHECK (status IN ('todo', 'in_progress', 'done')),
    assignee TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

  Run this once via `pool.query(...)` before `server.listen(8080)`.

- `title` is required. If it's missing (or not a non-empty string),
  return `400 Bad Request`.
- `assignee` is optional — omit it, or send `null`, and the stored value
  should be SQL `NULL` (which serializes as JSON `null`).
- `status` is optional. If omitted, the inserted row defaults to
  `"todo"`. If provided, it must be one of `"todo"`, `"in_progress"`, or
  `"done"` — anything else returns `400 Bad Request` with body:

  ```json
  { "error": "invalid status", "allowed": ["todo", "in_progress", "done"] }
  ```

- Since `node:http` gives you the raw request stream, read and parse the
  body yourself:

  ```ts
  function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(data));
      req.on("error", reject);
    });
  }
  ```
