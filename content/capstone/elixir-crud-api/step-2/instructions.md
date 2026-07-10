# Step 2 — POST /users

With the server up from Step 1, it's time to add persistence. This step
introduces the `users` table and the first write path the rest of the
capstone builds on — every later step reads or mutates rows this endpoint
creates. It also introduces the two things every remaining step needs:
reading a request body, and talking to Postgres via Postgrex.

## The task

Add a handler for `POST /users` that creates a user and persists it in
Postgres.

**Request body:**

```json
{ "name": "Alice", "email": "alice@example.com" }
```

**Response:** `201 Created` with the inserted row, including the
database-generated `id` and `created_at` fields:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "created_at": "2026-07-08T12:00:00Z"
}
```

Requirements:

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session, in `postgresql://user:pass@host:port/db`
  form). `Postgrex.start_link/1` does **not** accept a `:url` option
  directly — it only takes individual keys (`:hostname`, `:port`,
  `:username`, `:password`, `:database`). Parse the URI yourself with
  Elixir's built-in `URI` module and pass the pieces through:

  ```elixir
  uri = URI.parse(System.get_env("DATABASE_URL"))
  [username, password] = String.split(uri.userinfo, ":", parts: 2)

  {:ok, pid} = Postgrex.start_link(
    hostname: uri.host,
    port: uri.port,
    username: username,
    password: password,
    database: String.trim_leading(uri.path, "/")
  )
  ```

  Start this once (e.g. from the same top-level call that starts your
  accept loop) and pass the connection `pid` down to every handler that
  needs it.

- Your server should create the `users` table itself on startup if it
  doesn't already exist:

  ```elixir
  Postgrex.query!(pid, """
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
  """, [])
  ```

- Reading the request body: once you've read the request line and headers
  line by line (as in Step 1), find the `Content-Length` header, parse it
  as an integer, and `:gen_tcp.recv(client, length)` to read exactly that
  many more bytes as the body.

- Elixir's standard library has no built-in JSON support until 1.18 (this
  session runs 1.17), and no JSON dependency is fetched for this project —
  don't reach for `Jason` or `JSON.encode!`, they aren't available. Parse
  the tiny, fixed-shape request bodies this capstone sends
  (`{"name":"...","email":"..."}`) with a small regex-based helper instead:

  ```elixir
  def extract_field(json, key) do
    case Regex.run(~r/"#{key}"\s*:\s*"([^"]*)"/, json) do
      [_, value] -> value
      nil -> nil
    end
  end
  ```

  Build response JSON the same way you'll build every response body for
  the rest of this capstone: plain string interpolation.

- Use `Postgrex.query!/3` with `$1`/`$2` placeholders rather than
  interpolating values into the SQL string — this capstone doesn't test
  for SQL injection, but it's the idiomatic, safe way to use Postgrex.

- Validate that both `name` and `email` are present (non-nil, non-empty)
  in the request body. If either is missing, return `400 Bad Request`.
