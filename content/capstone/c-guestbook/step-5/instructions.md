# Step 5 — Recent entries

Guests want to see the newest entries, not the whole history. This is
the first endpoint that returns more than one row. You build a JSON
*array* in C, with no JSON library and no growable string buffer like
`std::string`.

## The task

Add a handler for `GET /entries/recent`. It returns the 5 newest entries,
newest first.

**Sample request and response:**

```
GET /entries/recent

200 OK
Content-Type: application/json

{"entries":[
 {"id":8,
  "name":"Visitor Eight",
  "message":"msg8",
  "created_at":"2026-07-01 09:07:00+00"},
 ...]}
```

### Querying the newest rows

`ORDER BY created_at DESC LIMIT 5` gets the newest rows first in one
query:

```c
PGresult *res = PQexec(conn,
    "SELECT id, name, message, "
    "created_at::text FROM entries "
    "ORDER BY created_at DESC LIMIT 5");
```

### The `snprintf` offset pattern

`strcat` scans the destination buffer from the start on each call to
find the end. That is fine for a few calls, but it wastes time in a loop.
The common C idiom keeps a running offset instead. The return value of
`snprintf` is the number of bytes it *would have* written, and you add it
to the offset:

```c
char body[8192];
int offset = snprintf(body, sizeof(body),
                      "{\"entries\":[");

int n = PQntuples(res);
for (int i = 0; i < n; i++) {
    offset += snprintf(body + offset,
        sizeof(body) - offset,
        "%s{\"id\":%s,"
        "\"name\":\"%s\","
        "\"message\":\"%s\","
        "\"created_at\":\"%s\"}",
        i > 0 ? "," : "",
        PQgetvalue(res, i, 0),
        PQgetvalue(res, i, 1),
        PQgetvalue(res, i, 2),
        PQgetvalue(res, i, 3));
}

offset += snprintf(body + offset,
    sizeof(body) - offset, "]}");
PQclear(res);
```

Each call writes from `body + offset`. Its limit is
`sizeof(body) - offset`, the remaining space, not the whole buffer. So
you never overwrite earlier output and never write past the end. The
`i > 0 ? "," : ""` expression puts a comma between elements and no comma
after the last one.

Requirements:

- Return the 5 most recently created entries, newest first
  (`ORDER BY created_at DESC LIMIT 5`).
- The response body shape is `{"entries": [...]}`. Each element has
  `id`, `name`, `message` and `created_at`.
- If the table has fewer than 5 entries, return all of them. Do not pad
  the array or return an error.
- Build the JSON array with the running-offset `snprintf` pattern above.
  Do not use repeated `strcat` calls.
