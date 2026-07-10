# Step 4 — GET /accounts/:id

With money moving in and out, add a read path so a caller can check an
account's current state without going through a deposit or withdrawal.
The transfers endpoint in Step 5 will reuse this same lookup logic to
validate both sides of a transfer before touching any balance.

## The task

Add a handler for `GET /accounts/:id` that fetches a single account by
its integer `id`.

**Sample request/response (found):**

```
GET /accounts/1

200 OK
Content-Type: application/json

{"id":1,"owner":"Ada Lovelace","balance_cents":5000}
```

**Sample request/response (not found):**

```
GET /accounts/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Return `200` with the account object (`id`, `owner`, `balance_cents`)
  as JSON if the id exists.
- Return `404` with body `{"error": "not found"}` if no account with that
  id exists.
- Parse the path parameter as an integer. If it isn't numeric, return
  `400 Bad Request`.
- Reuse the same database connection pattern you set up in Step 2 — a
  single `SELECT` is enough here, no transaction needed for a read-only
  lookup.
