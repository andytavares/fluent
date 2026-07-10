# Step 2 — POST /readings

With the server up from Step 1, it's time to add persistence. This step
introduces the `readings` table and the first write path the rest of the
capstone builds on. It also introduces the two things every remaining step
needs: reading a request body, and talking to Postgres via libpq.

## Why milli-units, not floats

Sensor values in this API travel as **integer milli-units** —
`value_milli: 21500` means 21.500 (degrees, volts, whatever the sensor
measures). This isn't arbitrary: floating point doesn't round-trip
losslessly through text (JSON has no native decimal type, and `21.5` parsed
back from a string can land on `21.499999999999996` depending on the
parser), and Postgres aggregates like `AVG()` over a `REAL`/`DOUBLE
PRECISION` column accumulate rounding error across many rows. An `INTEGER`
column storing thousandths of a unit sidesteps both problems entirely —
addition, comparison, and `SUM()` are exact, and you only convert to a
decimal representation at the very edge (if a client wants one). This is
the same reason financial systems store cents instead of dollars-as-float.

## The task

Add a handler for `POST /readings` that records a sensor reading and
persists it in Postgres.

**Request body:**

```json
{ "sensor": "temp-1", "value_milli": 21500 }
```

**Response:** `201 Created` with the inserted row, including the
database-generated `id` and `taken_at` fields:

```json
{
  "id": 1,
  "sensor": "temp-1",
  "value_milli": 21500,
  "taken_at": "2026-07-08T12:00:00Z"
}
```

Requirements:

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session), via libpq's `PQconnectdb`. libpq accepts
  the native `postgresql://user:pass@host/db` connection URI format
  directly — the same format `DATABASE_URL` is already in — so no parsing
  is needed:

  ```cpp
  #include <libpq-fe.h>

  PGconn *conn = PQconnectdb(getenv("DATABASE_URL"));
  if (PQstatus(conn) != CONNECTION_OK) {
    // handle connection failure, PQerrorMessage(conn) has details
  }
  ```

  Wrapping `PGconn*` in a small RAII class (destructor calls `PQfinish`),
  the same discipline you used for the client socket in Step 1, is good
  practice, but a plain global connection is fine too — use your judgment.

- Your server should create the `readings` table itself on startup if it
  doesn't already exist, e.g. via `PQexec`:

  ```sql
  CREATE TABLE IF NOT EXISTS readings (
    id SERIAL PRIMARY KEY,
    sensor TEXT NOT NULL,
    value_milli INTEGER NOT NULL,
    taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- Reading the request body: once you've parsed the request line and
  skipped past the headers (read until the blank line `\r\n\r\n`), find the
  `Content-Length` header, parse it as an integer, and `recv()` exactly
  that many more bytes as the body.

- Parsing the tiny, fixed-shape JSON bodies this capstone sends doesn't
  need a JSON library. A simple helper that finds a key in the string,
  skips to the next `"`, and reads until the closing `"` handles string
  fields; for the numeric `value_milli` field, find the `:` after the key
  and read digits (allowing a leading `-`) until a non-digit character:

  ```cpp
  std::string extract_string(const std::string &json, const std::string &key) {
    std::string needle = "\"" + key + "\"";
    auto pos = json.find(needle);
    if (pos == std::string::npos) return "";
    pos = json.find('"', pos + needle.size() + 1);
    auto end = json.find('"', pos + 1);
    return json.substr(pos + 1, end - pos - 1);
  }
  ```

- Use `PQexecParams` with placeholders (`$1`, `$2`) rather than
  string-concatenating values into SQL — this capstone doesn't test for
  SQL injection, but it's the idiomatic, safe way to use libpq and avoids
  quoting bugs.

- Validate that `sensor` is present (non-empty) and `value_milli` parses
  as an integer. If either check fails, return `400 Bad Request`.
