# Step 5 — DELETE /users/:id

The last single-resource operation: removing a user. This closes out the
single-record CRUD surface before Step 6 adds a collection endpoint.

## The task

Add a handler for `DELETE /users/:id` that deletes a user by id.

**Sample request/response (deleted):**

```
DELETE /users/2

204 No Content
```

**Sample request/response (not found):**

```
DELETE /users/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

### Checking rows affected

`PQcmdTuples` returns a string with the number of rows affected by the
most recent `INSERT`/`UPDATE`/`DELETE`. Convert it with `atoi` and check
for zero:

```c
char id_str[32];
snprintf(id_str, sizeof(id_str), "%ld", id);
const char *params[1] = { id_str };

PGresult *res = PQexecParams(
    conn, "DELETE FROM users WHERE id = $1",
    1, NULL, params, NULL, NULL, 0);

int rows_affected = atoi(PQcmdTuples(res));
PQclear(res);

if (rows_affected == 0) {
    // 404, body {"error":"not found"}
} else {
    // 204, empty body
}
```

For a `204 No Content` response, write the status line and headers but no
body — and set `Content-Length: 0` explicitly:

```c
const char *response = "HTTP/1.1 204 No Content\r\nContent-Length: 0\r\n\r\n";
write(client_fd, response, strlen(response));
```

Requirements:

- Return `204 No Content` on success, with an empty response body.
- Return `404` with body `{"error": "not found"}` if no user with that id
  exists.
- Check the number of rows affected by the delete; if it's zero, the id
  wasn't found.
- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
