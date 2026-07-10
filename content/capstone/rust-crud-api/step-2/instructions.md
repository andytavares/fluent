# Step 2 — POST /users

With the server up from Step 1, it's time to add persistence. This step
introduces the `users` table and the first write path the rest of the
capstone builds on — every later step reads or mutates rows this endpoint
creates.

It also introduces the two things every later step needs: reading a
request body off the raw socket, and connecting to Postgres with the
`postgres` crate.

## The task

Add a handler for `POST /users` that creates a user and persists it in
Postgres.

**Request body:**

```json
{ "name": "Alice", "email": "alice@example.com" }
```

**Response:** `201 Created` with the inserted row, including the
database-generated `id` and `created_at` fields:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "created_at": "2026-07-08 12:00:00+00"
}
```

### Connecting to Postgres

Your `Cargo.toml` already declares `postgres = "0.19"` as its only
dependency (pre-fetched — no other crate is reachable from this session).
It's the synchronous, blocking client, so no async runtime is involved.

`Client::connect` accepts a libpq-style connection string directly,
including the `postgresql://user:pass@host/db` URI format — `DATABASE_URL`
is already in that format, so no reformatting is needed:

```rust
use postgres::{Client, NoTls};

let mut client = Client::connect(&std::env::var("DATABASE_URL").unwrap(), NoTls)
    .expect("failed to connect to postgres");
```

Create the table on startup if it doesn't exist:

```rust
client
    .batch_execute(
        "CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )",
    )
    .expect("failed to create table");
```

Insert a row and get the generated columns back with `query_one` and
`RETURNING`. Cast `created_at` to `text` in the query itself — the
`postgres` crate's default build doesn't include the `chrono`/`time`
feature flags, so decoding `TIMESTAMPTZ` directly into a Rust date type
isn't available; casting to `text` in SQL sidesteps that and lets you read
it as a plain `String`:

```rust
let row = client
    .query_one(
        "INSERT INTO users (name, email) VALUES ($1, $2)
         RETURNING id, name, email, created_at::text",
        &[&name, &email],
    )
    .expect("insert failed");

let id: i32 = row.get(0);
let name: String = row.get(1);
let email: String = row.get(2);
let created_at: String = row.get(3);
```

### Reading the request body

Unlike Step 1, you now need to read past the headers to reach the body.
The simplest approach for this capstone: keep reading off the socket until
you've seen the blank line that ends the headers (`\r\n\r\n`), pull
`Content-Length` out of the header text, then keep reading until you have
that many body bytes.

```rust
fn read_request(stream: &mut TcpStream) -> (String, String, String) {
    let mut buf = Vec::new();
    let mut chunk = [0u8; 4096];
    loop {
        let n = stream.read(&mut chunk).unwrap_or(0);
        if n == 0 {
            break;
        }
        buf.extend_from_slice(&chunk[..n]);
        if let Some(header_end) = find_double_crlf(&buf) {
            let headers = String::from_utf8_lossy(&buf[..header_end]).to_string();
            let content_length = parse_content_length(&headers);
            let body_start = header_end + 4;
            while buf.len() < body_start + content_length {
                let n = stream.read(&mut chunk).unwrap_or(0);
                if n == 0 {
                    break;
                }
                buf.extend_from_slice(&chunk[..n]);
            }
            let body = String::from_utf8_lossy(&buf[body_start..body_start + content_length]).to_string();
            let request_line = headers.lines().next().unwrap_or("").to_string();
            return (request_line, headers, body);
        }
    }
    (String::new(), String::new(), String::new())
}
```

If `Content-Length` is absent (no body expected — GET/DELETE requests),
treat the body as empty.

### Hand-rolled JSON

There's no JSON crate available either. Every request/response body in
this capstone has a small, fixed shape, so a minimal string-scanning parser
is enough — find the key's quoted literal, then read the quoted value that
follows it:

```rust
fn extract_field(body: &str, key: &str) -> Option<String> {
    let needle = format!("\"{key}\"");
    let key_pos = body.find(&needle)?;
    let after_key = &body[key_pos + needle.len()..];
    let colon_pos = after_key.find(':')?;
    let after_colon = after_key[colon_pos + 1..].trim_start();
    let rest = after_colon.strip_prefix('"')?;
    let end = rest.find('"')?;
    Some(rest[..end].to_string())
}
```

Build response JSON with plain `format!` — every response shape in this
capstone is fixed, so string formatting is sufficient (just remember to
escape any `"` in string fields if you want to be thorough — the sample
data in this capstone never contains one):

```rust
format!(
    r#"{{"id":{id},"name":"{name}","email":"{email}","created_at":"{created_at}"}}"#
)
```

Requirements:

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session) via the `postgres` crate with `NoTls`.
- Your server should create the `users` table itself on startup if it
  doesn't already exist.
- Validate that both `name` and `email` are present (and non-empty) in the
  request body. If either is missing, return `400 Bad Request`.
- Read the full request body using `Content-Length` before responding —
  don't assume the whole body arrives in a single `read()` call.
