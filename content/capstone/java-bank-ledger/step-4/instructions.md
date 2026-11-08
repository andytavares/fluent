# Step 4 — GET /accounts/:id

Money moves in and out now. Add a read path so that a caller can check
an account's current state without a deposit or withdrawal. The
transfers endpoint in Step 5 uses the same lookup to validate both sides
of a transfer before it changes any balance.

## The task

Add a handler for `GET /accounts/:id`. It fetches one account by its
integer `id`.

**Sample request and response (found):**

```
GET /accounts/1

200 OK
Content-Type: application/json

{"id":1,"owner":"Ada Lovelace",
 "balance_cents":5000}
```

**Sample request and response (not found):**

```
GET /accounts/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- If the id exists, return `200` with the account object as JSON:
  `id`, `owner`, `balance_cents`.
- If no account has that id, return `404` with body
  `{"error": "not found"}`.
- Parse the path parameter as an integer. If it is not numeric, return
  `400 Bad Request`.
- Use the database connection pattern from Step 2. A single `SELECT` is
  enough. A read-only lookup needs no transaction.
