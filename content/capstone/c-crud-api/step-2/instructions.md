# Step 2 — POST /users

With the server up from Step 1, it's time to add persistence. This step
introduces the `users` table and the first write path the rest of the
capstone builds on — every later step reads or mutates rows this endpoint
creates.

It also introduces the two things every later step needs: reading a
request body off the raw socket, and connecting to Postgres with `libpq`.

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
  "created_at": "2026-07-08 12:00:00+00"
}
```

### Connecting to Postgres

`libpq-dev` is preinstalled (link with `-lpq`, `#include <libpq-fe.h>`).
`PQconnectdb` accepts a libpq connection string directly, including the
`postgresql://user:pass@host/db` URI format — `DATABASE_URL` is already in
that format, so no reformatting is needed:

```c
#include <libpq-fe.h>
#include <stdlib.h>

PGconn *conn = PQconnectdb(getenv("DATABASE_URL"));
if (PQstatus(conn) != CONNECTION_OK) {
    fprintf(stderr, "connection failed: %s", PQerrorMessage(conn));
    exit(1);
}
```

Create the table on startup if it doesn't exist, using a plain `PQexec`
(no parameters needed):

```c
PGresult *res = PQexec(conn,
    "CREATE TABLE IF NOT EXISTS users ("
    "  id SERIAL PRIMARY KEY,"
    "  name TEXT NOT NULL,"
    "  email TEXT UNIQUE NOT NULL,"
    "  created_at TIMESTAMPTZ DEFAULT NOW()"
    ")");
PQclear(res);
```

Insert a row and get the generated columns back with `PQexecParams` and
`RETURNING`. All parameters here are plain text strings, so pass `NULL`
for `paramTypes`, `paramLengths`, and `paramFormats`, and `0` for
`resultFormat` (text results):

```c
const char *params[2] = { name, email };
PGresult *res = PQexecParams(
    conn,
    "INSERT INTO users (name, email) VALUES ($1, $2) "
    "RETURNING id, name, email, created_at::text",
    2, NULL, params, NULL, NULL, 0);

if (PQresultStatus(res) != PGRES_TUPLES_OK) {
    // insert failed — inspect PQerrorMessage(conn)
}

const char *id = PQgetvalue(res, 0, 0);
const char *ret_name = PQgetvalue(res, 0, 1);
const char *ret_email = PQgetvalue(res, 0, 2);
const char *created_at = PQgetvalue(res, 0, 3);
// ... build the response body, then PQclear(res)
```

`created_at` is cast to `text` right in the query. `PQgetvalue` always
returns results in text format when `resultFormat` is `0`, so casting in
SQL means you get a ready-to-use string back with no extra parsing.

### Reading the request body

Unlike Step 1, you now need to read past the headers to reach the body.
Keep `read()`-ing into a growing buffer until you've seen `"\r\n\r\n"`
(the end of the headers), pull `Content-Length` out of the header text
with `strstr`/`atoi`, then keep reading until you have that many body
bytes:

```c
static long content_length(const char *headers) {
    const char *cl = strstr(headers, "Content-Length:");
    if (!cl) return 0;
    return atol(cl + strlen("Content-Length:"));
}

// after finding "\r\n\r\n" at offset header_end in your read buffer:
long need = content_length(buf);
long have = total_read - (header_end + 4);
while (have < need) {
    ssize_t n = read(client_fd, buf + total_read, sizeof(buf) - total_read - 1);
    if (n <= 0) break;
    total_read += n;
    have += n;
}
const char *body = buf + header_end + 4;
```

If `Content-Length` is absent (no body expected — GET/DELETE requests),
treat the body as empty.

### Hand-rolled JSON

There's no JSON library available either. Every request/response body in
this capstone has a small, fixed shape, so a minimal string-scanning
parser is enough — find the key's quoted literal with `strstr`, then copy
the quoted value that follows it:

```c
// Copies the value of "key" from a {"key":"value",...} JSON body into out.
// Returns 0 on success, -1 if the key wasn't found.
static int extract_field(const char *body, const char *key, char *out, size_t out_size) {
    char needle[64];
    snprintf(needle, sizeof(needle), "\"%s\"", key);
    const char *key_pos = strstr(body, needle);
    if (!key_pos) return -1;
    const char *colon = strchr(key_pos, ':');
    if (!colon) return -1;
    const char *quote_start = strchr(colon, '"');
    if (!quote_start) return -1;
    quote_start++;
    const char *quote_end = strchr(quote_start, '"');
    if (!quote_end) return -1;
    size_t len = quote_end - quote_start;
    if (len >= out_size) len = out_size - 1;
    memcpy(out, quote_start, len);
    out[len] = '\0';
    return 0;
}
```

Build response JSON with `snprintf` — every response shape in this
capstone is fixed, so string formatting is sufficient:

```c
char body_out[512];
snprintf(body_out, sizeof(body_out),
    "{\"id\":%s,\"name\":\"%s\",\"email\":\"%s\",\"created_at\":\"%s\"}",
    id, ret_name, ret_email, created_at);
```

Requirements:

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session) via `PQconnectdb`.
- Your server should create the `users` table itself on startup if it
  doesn't already exist.
- Validate that both `name` and `email` are present (and non-empty) in the
  request body. If either is missing, return `400 Bad Request`.
- Read the full request body using `Content-Length` before responding —
  don't assume the whole body arrives in a single `read()` call.
- Call `PQclear()` on every `PGresult` once you're done reading from it.
