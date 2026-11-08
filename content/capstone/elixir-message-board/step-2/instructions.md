# Step 2 — POST /channels

The server from Step 1 runs. This step adds persistence: the `channels`
table and the first write path that the rest of the capstone builds on.
It also adds what every later step needs. You read a request body, talk
to Postgres through Postgrex, and turn a constraint violation into an
HTTP status code instead of a crash.

## The task

Add a handler for `POST /channels` that creates a channel.

**Request body:**

```json
{ "name": "general" }
```

**Response:** `201 Created` with the inserted row:

```json
{
  "id": 1,
  "name": "general",
  "created_at": "2026-07-08T12:00:00Z"
}
```

If a channel with that name exists, respond `409 Conflict`:

```json
{ "error": "channel exists" }
```

Requirements:

- Connect to Postgres with the `DATABASE_URL` environment variable. Your
  session sets it in `postgresql://user:pass@host:port/db` form.
  `Postgrex.start_link/1` does **not** accept a `:url` option. It takes
  only separate keys: `:hostname`, `:port`, `:username`, `:password` and
  `:database`. Parse the URI with the built-in `URI` module and pass the
  parts through:

  ```elixir
  uri =
    URI.parse(System.get_env("DATABASE_URL"))

  [username, password] =
    String.split(uri.userinfo, ":", parts: 2)

  {:ok, pid} =
    Postgrex.start_link(
      hostname: uri.host,
      port: uri.port,
      username: username,
      password: password,
      database:
        String.trim_leading(uri.path, "/")
    )
  ```

  Start the connection once, for example from the top-level call that
  starts your accept loop. Pass the connection `pid` to every handler
  that needs it.

- On startup, create the `channels` and `messages` tables if they do not
  exist. Step 3 needs `messages`. Creating both now avoids a migration
  order problem later:

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
    channel_id INTEGER NOT NULL
      REFERENCES channels(id)
      ON DELETE CASCADE,
    author TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
  """, [])
  ```

- To read the request body, first read the request line and the headers
  line by line, as in Step 1. Find the `Content-Length` header and parse
  it as an integer. Then call `:gen_tcp.recv(client, length)` to read
  exactly that many bytes as the body.

- The Elixir standard library has no JSON support before 1.18, and this
  session runs 1.17. The project fetches no JSON dependency, so `Jason`
  and `JSON.encode!` are not available. Parse the small, fixed-shape
  request bodies of this capstone with a regex helper:

  ```elixir
  def extract_field(json, key) do
    pattern =
      ~r/"#{key}"\s*:\s*"([^"]*)"/

    case Regex.run(pattern, json) do
      [_, value] -> value
      nil -> nil
    end
  end
  ```

  Build every response body in this capstone with plain string
  interpolation.

- Make sure that `name` is present: not nil and not empty. If it is
  missing, return `400 Bad Request`.

- Use `Postgrex.query/3` for the insert, not the bang variant `query!/3`.
  A unique-constraint violation on `name` then returns an
  `{:error, reason}` tuple. It does not raise and crash the connection
  handler. The `reason` is a `%Postgrex.Error{}` struct. Its `postgres`
  field describes the Postgres error:

  ```elixir
  sql =
    "INSERT INTO channels (name) " <>
      "VALUES ($1) RETURNING *"

  case Postgrex.query(pid, sql, [name]) do
    {:ok, result} ->
      # Build the 201 response
      # from result.rows.

    {:error,
     %Postgrex.Error{
       postgres: %{code: :unique_violation}
     }} ->
      # Respond 409 with
      # {"error": "channel exists"}.

    {:error, _reason} ->
      # Treat anything else as a
      # generic failure.
  end
  ```
