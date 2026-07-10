# Step 6 — GET /users (paginated)

The final ticket: a collection endpoint for listing users, since real
clients rarely want every row at once. The fixtures for this step seed
enough rows to actually exercise pagination across two pages.

## The task

Add a handler for `GET /users` that lists users with offset-based
pagination via query params:

```
GET /users?page=1&limit=10
```

- `page` defaults to `1` if omitted.
- `limit` defaults to `10` if omitted, and is clamped to a maximum of
  `100` if a caller requests more.

**Response:** `200 OK` with:

```json
{
  "users": [
    { "id": 15, "name": "...", "email": "...", "created_at": "..." },
    { "id": 14, "name": "...", "email": "...", "created_at": "..." }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### Parsing the query string

The path component of your request line now includes a `?` — split on it,
then split the query string on `&` and `=`:

```rust
fn parse_query(path: &str) -> (i64, i64) {
    let mut page = 1i64;
    let mut limit = 10i64;
    if let Some((_, query)) = path.split_once('?') {
        for pair in query.split('&') {
            if let Some((key, value)) = pair.split_once('=') {
                match key {
                    "page" => page = value.parse().unwrap_or(1),
                    "limit" => limit = value.parse().unwrap_or(10),
                    _ => {}
                }
            }
        }
    }
    (page.max(1), limit.clamp(1, 100))
}
```

### Querying with a count and a page

Run two queries: one for the total row count, one for the current page,
ordered newest-first:

```rust
let total: i64 = client
    .query_one("SELECT COUNT(*) FROM users", &[])
    .expect("count failed")
    .get(0);

let offset = (page - 1) * limit;
let rows = client
    .query(
        "SELECT id, name, email, created_at::text FROM users
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2",
        &[&limit, &offset],
    )
    .expect("list query failed");
```

### Building the JSON array

Map each `Row` to a JSON object string with your Step 2 formatting helper,
join them with commas, and wrap in `[...]`:

```rust
let users_json: Vec<String> = rows
    .iter()
    .map(|row| {
        let id: i32 = row.get(0);
        let name: String = row.get(1);
        let email: String = row.get(2);
        let created_at: String = row.get(3);
        format!(r#"{{"id":{id},"name":"{name}","email":"{email}","created_at":"{created_at}"}}"#)
    })
    .collect();

let body = format!(
    r#"{{"users":[{}],"total":{total},"page":{page},"limit":{limit}}}"#,
    users_json.join(",")
);
```

Requirements:

- Order results by `created_at DESC` so the newest users appear first.
- `total` is the total count of users in the table, independent of the
  current page — use a separate `COUNT(*)` query.
- Use `OFFSET (page - 1) * limit` for pagination.
- Clamp `limit` to `100` max even if a caller requests a larger value.
- With the seeded fixtures (15 users) and the default `limit=10`, page 1
  returns 10 users and page 2 returns the remaining 5.
