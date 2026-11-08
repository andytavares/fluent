# Step 5 — Transfers

This ticket tests whether your transaction handling is correct. A
transfer touches **two** accounts and writes **two** entries:
`transfer_out` on the source and `transfer_in` on the destination. All
four writes succeed together, or none of them happen. Money never leaves
one account without arriving at the other.

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

- `amount_cents` must be a positive integer. If it is missing, zero or
  negative, return `400 Bad Request`.
- If `from` or `to` is not an existing account id, return `404` with
  body `{"error": "not found"}`. Check this before you change any
  balance.
- If the `from` balance is less than `amount_cents`, return `409` with
  body `{"error": "insufficient funds"}`.
- In the `409` case, **write nothing to the database**: no `entries`
  rows and no balance changes on either account. The graders read both
  balances again after a failed transfer and check that they did not
  change.
- On success, do all four writes in a single transaction:
  1. Insert an `entries` row on `from` with `kind` `'transfer_out'`.
  2. Insert an `entries` row on `to` with `kind` `'transfer_in'`.
  3. Decrease the `balance_cents` of `from`.
  4. Increase the `balance_cents` of `to`.

The pattern is the same as in Step 3, with two accounts and four
statements. Put them inside one `setAutoCommit(false)` / `commit()` /
`rollback()` block:

```java
Connection conn = connect();
try {
  conn.setAutoCommit(false);

  // read the balances of both ids
  // if either is missing:
  //   404, rollback, return
  // if from balance < amount:
  //   409, rollback, return

  // insert transfer_out entry for `from`
  // insert transfer_in entry for `to`
  // update balance_cents of both accounts

  conn.commit();
} catch (Exception e) {
  conn.rollback();
  throw e;
} finally {
  conn.setAutoCommit(true);
}
```

An early return on a `404` or `409` inside the `try` block must call
`conn.rollback()` first. You can also never call `commit()` and let the
`finally` block restore auto-commit. In both cases, no partial writes
reach the table.
