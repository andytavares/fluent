# Step 5 — Recent entries

Guests want to see what's freshest, not the whole history. This is the
first endpoint that returns more than one row, which means building a JSON
*array* in C — with no JSON library, and no `std::string`-style
append-as-you-go buffer either.

## The task

Add a handler for `GET /entries/recent` that returns the 5 newest entries,
newest first.

**Sample request/response:**

```
GET /entries/recent

200 OK
Content-Type: application/json

{"entries":[{"id":8,"name":"Visitor Eight","message":"msg8","created_at":"2026-07-01 09:07:00+00"},...]}
```

### Querying the newest rows

`ORDER BY created_at DESC LIMIT 5` gets you the newest-first rows in one
query:

```c
PGresult *res = PQexec(conn,
    "SELECT id, name, message, created_at::text FROM entries "
    "ORDER BY created_at DESC LIMIT 5");
```

### The `snprintf` offset pattern

`strcat` re-scans the destination buffer from the start every time you
call it to find where to append — fine for a handful of calls, wasteful
in a loop. The more common C idiom for building up a buffer incrementally
is to track a running offset and let `snprintf`'s return value (the number
of bytes it *would have* written) advance it:

```c
char body[8192];
int offset = snprintf(body, sizeof(body), "{\"entries\":[");

int n = PQntuples(res);
for (int i = 0; i < n; i++) {
    offset += snprintf(body + offset, sizeof(body) - offset,
        "%s{\"id\":%s,\"name\":\"%s\",\"message\":\"%s\",\"created_at\":\"%s\"}",
        i > 0 ? "," : "",
        PQgetvalue(res, i, 0), PQgetvalue(res, i, 1),
        PQgetvalue(res, i, 2), PQgetvalue(res, i, 3));
}

offset += snprintf(body + offset, sizeof(body) - offset, "]}");
PQclear(res);
```

Each call writes starting at `body + offset` and is bounded by
`sizeof(body) - offset` — the remaining space, not the whole buffer —so
you never overwrite what you already wrote and never write past the end.
The `i > 0 ? "," : ""` trick keeps commas between elements without a
trailing comma after the last one.

Requirements:

- Return the 5 most recently created entries, newest first
  (`ORDER BY created_at DESC LIMIT 5`).
- Response body shape: `{"entries": [...]}`, where each element has `id`,
  `name`, `message`, and `created_at`.
- If there are fewer than 5 entries in the table, return however many
  exist — don't pad or error.
- Build the JSON array with the running-offset `snprintf` pattern shown
  above, not repeated `strcat` calls.
