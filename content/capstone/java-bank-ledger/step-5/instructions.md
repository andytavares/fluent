# Step 5 — Transfers

This is the ticket that actually tests whether your transaction handling
is correct. A transfer touches **two** accounts and writes **two**
entries (`transfer_out` on the source, `transfer_in` on the destination).
All four writes succeed together or none of them happen — there's no
partial transfer where money leaves one account without arriving at the
other.

## The task

Add a handler for `POST /transfers`:

**Request body:**

```json
{ "from": 1, "to": 2, "amount_cents": 300 }
```

**Response on success:** `200 OK` with both updated balances:

```json
{
  "from_id": 1,
  "to_id": 2,
  "amount_cents": 300,
  "from_balance_cents": 700,
  "to_balance_cents": 800
}
```

**Response on insufficient funds:** `409 Conflict`:

```json
{ "error": "insufficient funds" }
```

**Response on unknown account:** `404 Not Found`:

```json
{ "error": "not found" }
```

Requirements:

- `amount_cents` must be a positive integer. If it's missing, zero, or
  negative, return `400 Bad Request`.
- If either `from` or `to` doesn't exist as an account id, return `404`
  with body `{"error": "not found"}`. Check this before touching any
  balance.
- If the `from` account's balance is less than `amount_cents`, return
  `409` with body `{"error": "insufficient funds"}`. **Nothing should be
  written to the database in this case** — no entries rows, no balance
  changes on either account. This is the part graders will check directly
  by re-reading both balances after a failed transfer and confirming
  they're unchanged.
- On success, do all four writes in a single transaction:
  1. Insert an `entries` row on `from` with `kind` `'transfer_out'`.
  2. Insert an `entries` row on `to` with `kind` `'transfer_in'`.
  3. Decrement `from`'s `balance_cents`.
  4. Increment `to`'s `balance_cents`.

  Same pattern as Step 3, just with two accounts and four statements
  inside one `setAutoCommit(false)` / `commit()` / `rollback()` block:

  ```java
  Connection conn = connect();
  try {
    conn.setAutoCommit(false);

    // read both accounts' balances (SELECT ... both ids)
    // if either missing -> 404, rollback, return
    // if from balance < amount -> 409, rollback, return

    // insert transfer_out entry for `from`
    // insert transfer_in entry for `to`
    // update both accounts' balance_cents

    conn.commit();
  } catch (Exception e) {
    conn.rollback();
    throw e;
  } finally {
    conn.setAutoCommit(true);
  }
  ```

  Returning early on a `404`/`409` inside the `try` block still needs to
  call `conn.rollback()` first (or simply never call `commit()` and let
  the `finally` restore auto-commit — either way, no partial writes should
  reach the table).
