# Step 3 — GET a key

Now that keys can be set, add a read path. This is the first endpoint that
reads existing rows rather than writing new ones — and the first place
expiry actually matters: an expired key has to behave exactly like a key
that was never set.

## The task

Add a handler for `GET /kv/:key` that fetches a key's current value.

**Sample request/response (found):**

```
GET /kv/greeting

200 OK
Content-Type: application/json

{"key":"greeting","value":"hello world","expires_at":null}
```

**Sample request/response (not found or expired):**

```
GET /kv/stale

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

### Parsing the path

You're matching paths by hand off the request line's path component
(`/kv/greeting`). Strip the `/kv/` prefix — whatever remains is the key
(keys in this capstone may contain colons, like `user:1`, so don't split
on `:`):

```rust
let path = "/kv/greeting";
if let Some(key) = path.strip_prefix("/kv/") {
    // look up key
}
```

### Filtering expiry in SQL, not in Rust

You could fetch the row, read `expires_at` back into Rust, and compare it
against the current time yourself — but that means trusting your
application server's clock to agree with the database's, and repeating
the same comparison in every handler that reads a key. It's simpler and
more correct to make expiry part of the `WHERE` clause itself, so an
expired row simply isn't a match:

```rust
let row = client
    .query_opt(
        "SELECT key, value, expires_at::text
         FROM kv_entries
         WHERE key = $1 AND (expires_at IS NULL OR expires_at > NOW())",
        &[&key],
    )
    .expect("query failed");

match row {
    Some(row) => {
        let key: String = row.get(0);
        let value: String = row.get(1);
        let expires_at: Option<String> = row.get(2);
        // build 200 response
    }
    None => {
        // build 404 response with {"error":"not found"}
    }
}
```

`query_opt` returns `Result<Option<Row>, Error>` — `None` now means either
"no such key" or "the key expired," and your handler doesn't need to tell
those apart. That single `WHERE` clause is the one place expiry logic
lives; every later endpoint that reads keys reuses the same condition.

Requirements:

- Return `200` with the key's current value as JSON if it exists and
  hasn't expired.
- Return `404` with body `{"error": "not found"}` if the key doesn't exist
  **or** if it exists but `expires_at` is in the past.
- Filter expiry in the SQL query itself (`expires_at IS NULL OR
  expires_at > NOW()`), not by fetching the row and checking the timestamp
  in Rust.
- Reuse the same database connection you set up in Step 2.
