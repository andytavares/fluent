# Step 2 — POST /readings

This step adds persistence to the server from Step 1. It adds the
`readings` table and the first write path. It also adds two things that
every later step needs: reading a request body, and calling Postgres
through libpq.

## Why milli-units, not floats

Sensor values in this API are **integer milli-units**. `value_milli: 21500`
means 21.500 degrees, volts or any other unit the sensor measures. A float
does not always survive the trip to text and back. For example, `0.1` has
no exact binary form, so its stored value differs from the text you read.
Postgres `AVG()` over a `REAL` or `DOUBLE PRECISION` column also adds
rounding error across many rows. An `INTEGER` column of thousandths avoids
both problems. Addition, comparison and `SUM()` are exact. You convert to a
decimal form only at the edge, when a client asks for one. Financial
systems store cents in place of float dollars for the same reason.

## The task

Add a handler for `POST /readings`. It records a sensor reading in
Postgres.

**Request body:**

```json
{
  "sensor": "temp-1",
  "value_milli": 21500
}
```

**Response:** `201 Created` with the inserted row. The row includes the
`id` and `taken_at` fields that the database generates:

```json
{
  "id": 1,
  "sensor": "temp-1",
  "value_milli": 21500,
  "taken_at": "2026-07-08T12:00:00Z"
}
```

Requirements:

- Connect to Postgres with libpq's `PQconnectdb` and the `DATABASE_URL`
  environment variable. The session sets this variable. libpq accepts the
  `postgresql://user:pass@host/db` URI format directly, so you do not parse
  it:

```cpp
#include <libpq-fe.h>

PGconn *conn =
    PQconnectdb(getenv("DATABASE_URL"));
if (PQstatus(conn) != CONNECTION_OK) {
  // Connection failed.
  // PQerrorMessage(conn) has details.
}
```

- You can wrap `PGconn*` in a small RAII class whose destructor calls
  `PQfinish`. It is the same rule you used for the client socket in Step 1.
  A plain global connection also works.

- Create the `readings` table on startup if it does not exist. Use
  `PQexec`:

```sql
CREATE TABLE IF NOT EXISTS readings (
  id SERIAL PRIMARY KEY,
  sensor TEXT NOT NULL,
  value_milli INTEGER NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL
    DEFAULT NOW()
);
```

- To read the request body, parse the request line and read the headers up
  to the blank line `\r\n\r\n`. Find the `Content-Length` header and parse
  it as an integer. Then `recv()` exactly that many more bytes as the body.

- The JSON bodies in this capstone are small and have a fixed shape, so you
  do not need a JSON library. For a string field, find the key, skip to the
  next `"`, and read up to the closing `"`. For the numeric `value_milli`
  field, find the `:` after the key. Then read digits, with an optional
  leading `-`, up to the first non-digit character.

```cpp
std::string extract_string(
    const std::string &json,
    const std::string &key) {
  std::string needle =
      "\"" + key + "\"";
  auto pos = json.find(needle);
  if (pos == std::string::npos)
    return "";
  pos = json.find(
      '"', pos + needle.size() + 1);
  auto end = json.find('"', pos + 1);
  return json.substr(
      pos + 1, end - pos - 1);
}
```

- Use `PQexecParams` with placeholders (`$1`, `$2`). Do not concatenate
  values into the SQL string. This capstone does not test SQL injection,
  but placeholders are the safe libpq idiom and prevent quoting bugs.

- Check that `sensor` is present and not empty. Check that `value_milli`
  parses as an integer. If either check fails, return `400 Bad Request`.
