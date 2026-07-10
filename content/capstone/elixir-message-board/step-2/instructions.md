# Step 2 — POST /channels

With the server up from Step 1, it's time to add persistence. This step
introduces the `channels` table and the first write path the rest of the
capstone builds on. It also introduces the things every remaining step
needs: reading a request body, talking to Postgres via Postgrex, and
turning a database constraint violation into an HTTP status code instead
of a crash.

## The task

Add a handler for `POST /channels` that creates a channel.

**Request body:**

```json
{ "name": "general" }
```

**Response:** `201 Created` with the inserted row:

```json
{ "id": 1, "name": "general", "created_at": "2026-07-08T12:00:00Z" }
```

If a channel with that name already exists, respond `409 Conflict`:

```json
{ "error": "channel exists" }
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

- Your server should create both the `channels` and `messages` tables on
  startup if they don't already exist (you'll need `messages` starting
  next step, but creating both now avoids a migration order problem
  later):

  ```elixir
  Postgrex.query!(pid, """
  CREATE TABLE IF NOT EXISTS channels (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
  """, [])

  Postgrex.query!(pid, """
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    body TEXT NOT NULL,
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
  the tiny, fixed-shape request bodies this capstone sends with a small
  regex-based helper instead:

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

- Validate that `name` is present (non-nil, non-empty). If it's missing,
  return `400 Bad Request`.

- Use `Postgrex.query/3` (not the bang variant `query!/3`) for the insert,
  so a unique-constraint violation on `name` comes back as an `{:error,
  reason}` tuple instead of raising and crashing the connection handler.
  The `reason` is a `%Postgrex.Error{}` struct with a `postgres` field
  describing the underlying Postgres error:

  ```elixir
  case Postgrex.query(pid, "INSERT INTO channels (name) VALUES ($1) RETURNING *", [name]) do
    {:ok, result} ->
      # build the 201 response from result.rows
    {:error, %Postgrex.Error{postgres: %{code: :unique_violation}}} ->
      # respond 409 with {"error": "channel exists"}
    {:error, _reason} ->
      # anything else — treat as a generic failure
  end
  ```
