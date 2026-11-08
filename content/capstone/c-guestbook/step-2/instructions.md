# Step 2 — Sign the guestbook

Your server from Step 1 now gets persistence. This step adds the
`entries` table and the first write path. Every later step reads the rows
that this endpoint creates.

This step also adds two things that every later step needs. You read a
request body from the raw socket, and you connect to Postgres with
`libpq`.

## The task

Add a handler for `POST /entries`. It creates a guestbook entry and
stores it in Postgres.

**Request body:**

```json
{ "name": "Bob", "message": "Great site!" }
```

**Response:** `201 Created` with the inserted row. The row includes the
`id` and `created_at` fields that the database generates:

```json
{
  "id": 1,
  "name": "Bob",
  "message": "Great site!",
  "created_at": "2026-07-10 12:00:00+00"
}
```

### Connecting to Postgres

The session has `libpq-dev`. Link with `-lpq` and use
`#include <libpq-fe.h>`. `PQconnectdb` accepts a libpq connection string,
including the `postgresql://user:pass@host/db` URI format.
`DATABASE_URL` already uses that format, so you pass it as it is:

```c
#include <libpq-fe.h>
#include <stdlib.h>

PGconn *conn =
    PQconnectdb(getenv("DATABASE_URL"));
if (PQstatus(conn) != CONNECTION_OK) {
    fprintf(stderr,
            "connection failed: %s",
            PQerrorMessage(conn));
    exit(1);
}
```

Create the table on startup if it does not exist. A plain `PQexec` with
no parameters does this:

```c
PGresult *res = PQexec(conn,
    "CREATE TABLE IF NOT EXISTS entries ("
    "  id SERIAL PRIMARY KEY,"
    "  name TEXT NOT NULL,"
    "  message TEXT NOT NULL,"
    "  created_at TIMESTAMPTZ"
    "    DEFAULT NOW()"
    ")");
PQclear(res);
```

Use `PQexecParams` with `RETURNING` to insert a row and get the generated
columns back. All parameters are plain text strings. Pass `NULL` for
`paramTypes`, `paramLengths` and `paramFormats`. Pass `0` for
`resultFormat` to get text results:

```c
const char *params[2] = { name, message };
PGresult *res = PQexecParams(
    conn,
    "INSERT INTO entries (name, message) "
    "VALUES ($1, $2) "
    "RETURNING id, name, message, "
    "created_at::text",
    2, NULL, params, NULL, NULL, 0);

if (PQresultStatus(res)
    != PGRES_TUPLES_OK) {
    // insert failed:
    // inspect PQerrorMessage(conn)
}

const char *id = PQgetvalue(res, 0, 0);
const char *ret_name =
    PQgetvalue(res, 0, 1);
const char *ret_message =
    PQgetvalue(res, 0, 2);
const char *created_at =
    PQgetvalue(res, 0, 3);
// build the response body,
// then PQclear(res)
```

The query casts `created_at` to `text`. With `resultFormat` set to `0`,
`PQgetvalue` always returns text. The cast in SQL gives you a string that
you can use with no extra parsing.

### Reading the request body

Unlike Step 1, you must now read past the headers to reach the body.
Call `read()` into a growing buffer until you find `"\r\n\r\n"`, the end
of the headers. Get `Content-Length` from the header text with
`strstr` and `atol`. Then read until you have that many body bytes:

```c
static long content_length(
        const char *headers) {
    const char *cl =
        strstr(headers, "Content-Length:");
    if (!cl) return 0;
    return atol(cl +
                strlen("Content-Length:"));
}

// "\r\n\r\n" starts at offset header_end
// in your read buffer:
long need = content_length(buf);
long have = total_read - (header_end + 4);
while (have < need) {
    ssize_t n = read(client_fd,
        buf + total_read,
        sizeof(buf) - total_read - 1);
    if (n <= 0) break;
    total_read += n;
    have += n;
}
const char *body = buf + header_end + 4;
```

A GET request has no body and no `Content-Length`. If the header is
absent, treat the body as empty.

### Hand-rolled JSON

The session has no JSON library. Every request and response body in this
capstone has a small, fixed shape, so a minimal string scanner is enough.
Find the quoted key with `strstr`, then copy the quoted value after it:

```c
// Copies the value of "key" from a
// {"key":"value",...} body into out.
// Returns 0 on success, -1 if the key
// is not found.
static int extract_field(
        const char *body, const char *key,
        char *out, size_t out_size) {
    char needle[64];
    snprintf(needle, sizeof(needle),
             "\"%s\"", key);
    const char *key_pos =
        strstr(body, needle);
    if (!key_pos) return -1;
    const char *colon =
        strchr(key_pos, ':');
    if (!colon) return -1;
    const char *quote_start =
        strchr(colon, '"');
    if (!quote_start) return -1;
    quote_start++;
    const char *quote_end =
        strchr(quote_start, '"');
    if (!quote_end) return -1;
    size_t len = quote_end - quote_start;
    if (len >= out_size)
        len = out_size - 1;
    memcpy(out, quote_start, len);
    out[len] = '\0';
    return 0;
}
```

Build the response JSON with `snprintf`. Every response in this
capstone has a fixed shape, so string formatting is enough:

```c
char body_out[512];
snprintf(body_out, sizeof(body_out),
    "{\"id\":%s,"
    "\"name\":\"%s\","
    "\"message\":\"%s\","
    "\"created_at\":\"%s\"}",
    id, ret_name, ret_message, created_at);
```

Requirements:

- Connect to Postgres with `PQconnectdb` and the `DATABASE_URL`
  environment variable. Your session already sets it.
- Your server must create the `entries` table on startup if the table
  does not exist.
- Both `name` and `message` must be present and non-empty in the request
  body. If either is missing, return `400 Bad Request`.
- Read the full request body with `Content-Length` before you respond.
  The body can arrive across more than one `read()` call.
- Call `PQclear()` on every `PGresult` after you read from it.
