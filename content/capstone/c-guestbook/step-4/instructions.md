# Step 4 — Visitor count

This step adds an aggregate endpoint: the total number of signed entries.
It is the simplest query in the capstone. It also shows exactly what
`libpq` gives back to you.

## The task

Add a handler for `GET /count`. It returns the total number of entries.

**Sample request and response:**

```
GET /count

200 OK
Content-Type: application/json

{"count":7}
```

### `PQgetvalue` always returns text

With `resultFormat = 0`, `PQexec` and `PQexecParams` return every column
as text, whatever its SQL type. `COUNT(*)` returns a SQL `bigint`, but
`PQgetvalue` gives you a C string such as `"7"`.

You do not parse it into an integer. The value goes straight into a JSON
field, so you put the `libpq` string into your response with `%s`:

```c
PGresult *res = PQexec(conn,
    "SELECT COUNT(*) FROM entries");
if (PQresultStatus(res)
    != PGRES_TUPLES_OK) {
    // query failed:
    // inspect PQerrorMessage(conn)
}

const char *count = PQgetvalue(res, 0, 0);

char body[64];
snprintf(body, sizeof(body),
         "{\"count\":%s}", count);
PQclear(res);
```

You need no `atoi` and no `strtol`. The text that `libpq` returns for a
numeric column is already a valid JSON number. Do not put quotes around
it.

Requirements:

- Return `200` with `{"count": N}`. `N` is the total number of rows in
  the `entries` table.
- Use one `SELECT COUNT(*)` query. Do not fetch every row and count the
  rows in C.
- Call `PQclear()` on the result after you read from it.
