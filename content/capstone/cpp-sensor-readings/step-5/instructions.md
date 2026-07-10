# Step 5 — DELETE /sensors/:name

Sensors get decommissioned or renamed, and their historical readings need
to go with them. This step purges every reading for a sensor in one
request, rather than deleting rows one at a time.

## The task

Add a handler for `DELETE /sensors/:name` that deletes every reading
belonging to a sensor.

**Sample request/response (purged):**

```
DELETE /sensors/temp-1

200 OK
Content-Type: application/json

{"deleted":3}
```

**Sample request/response (not found):**

```
DELETE /sensors/temp-99

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Run `DELETE FROM readings WHERE sensor = $1` via `PQexecParams`.
- `PQcmdTuples(result)` returns the number of rows affected by a `DELETE`
  as a string — parse it as an integer for the `deleted` count.
- Return `200` with `{"deleted": N}` where `N` is the number of rows
  removed, when `N` is greater than zero.
- Return `404` with body `{"error": "not found"}` when the sensor had no
  readings to delete — i.e. `PQcmdTuples` parses to `0`.
- Reuse the same `PGconn*` connection you set up in Step 2.
