# Step 3 — GET /users/:id

Now that users can be created, add a read path. This is the first endpoint
that reads existing rows rather than writing new ones — the fixtures loaded
for this step already contain rows to fetch.

## The task

Add a handler for `GET /users/:id` that fetches a single user by their
integer `id`.

**Sample request/response (found):**

```
GET /users/1

200 OK
Content-Type: application/json

{"id":1,"name":"Ada Lovelace","email":"ada@example.com","created_at":"2026-07-01 09:00:00+00"}
```

**Sample request/response (not found):**

```
GET /users/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

### Parsing the path

You're matching paths by hand off the request line's path component
(`/users/1`). Strip the `/users/` prefix and try to parse the remainder as
an `i32`:

```rust
let path = "/users/1";
if let Some(id_str) = path.strip_prefix("/users/") {
    match id_str.parse::<i32>() {
        Ok(id) => { /* look up id */ }
        Err(_) => { /* 400 Bad Request */ }
    }
}
```

### Querying

Use `query_opt`, which returns `Result<Option<Row>, Error>` — `None` means
no row matched, which is exactly the 404 case:

```rust
let row = client
    .query_opt(
        "SELECT id, name, email, created_at::text FROM users WHERE id = $1",
        &[&id],
    )
    .expect("query failed");

match row {
    Some(row) => {
        let id: i32 = row.get(0);
        let name: String = row.get(1);
        let email: String = row.get(2);
        let created_at: String = row.get(3);
        // build 200 response
    }
    None => {
        // build 404 response with {"error":"not found"}
    }
}
```

Requirements:

- Return `200` with the user object as JSON if the id exists.
- Return `404` with body `{"error": "not found"}` if no user with that id
  exists.
- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
- Reuse the same database connection you set up in Step 2.
