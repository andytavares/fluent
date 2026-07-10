# Step 4 — DELETE a key

The last single-key write operation: removing a key outright. This closes
out the single-key surface before Step 5 adds derived read semantics
(remaining TTL) and Step 6 adds a collection endpoint.

## The task

Add a handler for `DELETE /kv/:key` that deletes a key by name.

**Sample request/response (deleted):**

```
DELETE /kv/todelete

204 No Content
```

**Sample request/response (not found):**

```
DELETE /kv/ghost

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

### Checking rows affected

`Client::execute` returns `Result<u64, Error>` — the number of rows the
statement affected. Zero means no key with that name existed:

```rust
let rows_affected = client
    .execute("DELETE FROM kv_entries WHERE key = $1", &[&key])
    .expect("delete failed");

if rows_affected == 0 {
    // 404, body {"error":"not found"}
} else {
    // 204, empty body
}
```

For a `204 No Content` response, write the status line and headers but no
body — and set `Content-Length: 0` explicitly:

```rust
let response = "HTTP/1.1 204 No Content\r\nContent-Length: 0\r\n\r\n";
stream.write_all(response.as_bytes()).unwrap();
```

Requirements:

- Return `204 No Content` on success, with an empty response body.
- Return `404` with body `{"error": "not found"}` if no key with that
  name exists.
- Delete unconditionally by key — an expired-but-not-yet-deleted row still
  counts as "found" for `DELETE` (unlike `GET`, this endpoint doesn't
  filter on `expires_at`).
- Check the number of rows affected by the delete; if it's zero, the key
  wasn't found.
