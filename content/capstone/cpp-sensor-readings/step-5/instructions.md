# Step 5 — DELETE /sensors/:name

When you retire or rename a sensor, its old readings must go too. This
step deletes all readings for a sensor in one request, not one row at a
time.

## The task

Add a handler for `DELETE /sensors/:name`. It deletes every reading of the
sensor.

**Sample request and response (purged):**

```
DELETE /sensors/temp-1

200 OK
Content-Type: application/json

{"deleted":3}
```

**Sample request and response (not found):**

```
DELETE /sensors/temp-99

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Run `DELETE FROM readings WHERE sensor = $1` with `PQexecParams`.
- `PQcmdTuples(result)` returns the number of rows a `DELETE` removed, as a
  string. Parse it as an integer for the `deleted` count.
- If the `DELETE` removed `N` rows and `N` is greater than zero, return `200` with
  `{"deleted": N}`.
- If the sensor had no readings, `PQcmdTuples` parses to `0`. Return `404`
  with body `{"error": "not found"}`.
- Reuse the `PGconn*` connection from Step 2.
