# Step 3 — Deposits & withdrawals

Accounts exist now. Add the two operations that move money. Here the
ledger design matters. A deposit or withdrawal is not only an `UPDATE`
on `accounts.balance_cents`. It is that update **plus** an immutable
`entries` row that records what happened.

Both writes must succeed or fail together. If your process crashes
between the two statements, you can get a balance change with no
record. You can also get a record with no matching balance change.

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
{
  "id": 1,
  "owner": "Alice",
  "balance_cents": 1500
}
```

**Response on insufficient funds (withdraw only):** `409 Conflict`:

```json
{ "error": "insufficient funds" }
```

Requirements:

- `amount_cents` must be a positive integer. If it is missing, zero or
  negative, return `400 Bad Request` for either endpoint.
- For `/withdraw`, `amount_cents` can be greater than the current
  `balance_cents`. Then return `409 Conflict` with body
  `{"error": "insufficient funds"}`. Write nothing to the database in
  this case.
- If the account id does not exist, return `404 Not Found` with body
  `{"error": "not found"}`.
- Each successful operation does these writes in a single transaction:
  1. Insert an `entries` row with `kind` `'deposit'` or `'withdrawal'`
     and the given `amount_cents`.
  2. Update `accounts.balance_cents`: `+` for a deposit, `-` for a
     withdrawal.
- Use the connection-per-request pattern from Step 2. Open a
  connection, run the transaction, close the connection.

Use the JDBC manual transaction mode to keep both writes atomic:

```java
Connection conn = connect();
try {
  conn.setAutoCommit(false);

  // 1. insert into entries
  // 2. update accounts.balance_cents
  // 3. read the new balance again
  //    (or track it locally)

  conn.commit();
} catch (Exception e) {
  conn.rollback();
  throw e;
} finally {
  conn.setAutoCommit(true);
}
```

Do the insufficient-funds check on the balance you read *inside* this
transaction, before you write anything. Do not rely only on the
`CHECK (balance_cents >= 0)` constraint to reject the write. A
constraint violation aborts the transaction with a generic SQL error,
not the clean `409` response that callers expect.
