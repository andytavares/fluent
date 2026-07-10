# Step 3 — Deposits & withdrawals

Now that accounts exist, add the two operations that actually move money.
This is where the ledger design shows up: a deposit or withdrawal isn't
just an `UPDATE` on `accounts.balance_cents` — it's that update **plus**
an immutable `entries` row recording what happened, and both writes must
succeed or fail together. If your process crashes between the two
statements, you don't want a balance change with no record of why, or a
record with no matching balance change.

## The task

Add handlers for:

```
POST /accounts/:id/deposit
POST /accounts/:id/withdraw
```

Both take the same request body:

```json
{ "amount_cents": 500 }
```

**Response on success:** `200 OK` with the account's new balance:

```json
{ "id": 1, "owner": "Alice", "balance_cents": 1500 }
```

**Response on insufficient funds (withdraw only):** `409 Conflict`:

```json
{ "error": "insufficient funds" }
```

Requirements:

- `amount_cents` must be a positive integer. If it's missing, zero, or
  negative, return `400 Bad Request` for either endpoint.
- For `/withdraw`, if `amount_cents` is greater than the account's current
  `balance_cents`, return `409 Conflict` with body
  `{"error": "insufficient funds"}`. Nothing should be written to the
  database in this case.
- If the account id doesn't exist, return `404 Not Found` with body
  `{"error": "not found"}`.
- Each successful operation must, in a single transaction:
  1. Insert an `entries` row with `kind` `'deposit'` or `'withdrawal'`
     and the given `amount_cents`.
  2. Update `accounts.balance_cents` accordingly (`+` for deposit, `-`
     for withdrawal).

  Use JDBC's manual transaction mode to keep both writes atomic:

  ```java
  Connection conn = connect();
  try {
    conn.setAutoCommit(false);

    // 1. insert into entries
    // 2. update accounts.balance_cents
    // 3. re-read the new balance (or track it locally)

    conn.commit();
  } catch (Exception e) {
    conn.rollback();
    throw e;
  } finally {
    conn.setAutoCommit(true);
  }
  ```

  Do the insufficient-funds check on the balance you read *inside* this
  transaction, before you write anything — don't rely solely on the
  `CHECK (balance_cents >= 0)` constraint to reject the write, since a
  constraint violation would abort the transaction with a generic SQL
  error rather than the clean `409` response callers expect.
- Reuse the same connection-per-request pattern from Step 2 — open a
  connection, do the transaction, close it.
