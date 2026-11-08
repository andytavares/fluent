# Step 4 — DELETE a key

This is the last single-key write operation: removing a key. It
completes the single-key endpoints. Step 5 adds a derived read (the
remaining TTL), and Step 6 adds a collection endpoint.

## The task

Add a handler for `DELETE /kv/:key`. It deletes a key by name.

**Sample request and response (deleted):**

```
DELETE /kv/todelete

204 No Content
```

**Sample request and response (not found):**

```
DELETE /kv/ghost

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

### Checking rows affected

`Client::execute` returns `Result<u64, Error>`: the number of rows that
the statement changed. Zero means that no key with that name existed:

```rust
let rows_affected = client
    .execute(
        "DELETE FROM kv_entries \
         WHERE key = $1",
        &[&key],
    )
    .expect("delete failed");

if rows_affected == 0 {
    // 404, body {"error":"not found"}
} else {
    // 204, empty body
}
```

For a `204 No Content` response, write the status line and the headers,
but no body. Set `Content-Length: 0` explicitly:

```rust
let response =
    "HTTP/1.1 204 No Content\r\n\
     Content-Length: 0\r\n\r\n";
stream
    .write_all(response.as_bytes())
    .unwrap();
```

Requirements:

- On success, return `204 No Content` with an empty response body.
- If no key with that name exists, return `404` with body
  `{"error": "not found"}`.
- Delete by key with no other condition. An expired row that is still in
  the table counts as "found" for `DELETE`. Unlike `GET`, this endpoint
  does not filter on `expires_at`.
- Check the number of rows that the delete changed. If it is zero, the
  key was not found.
