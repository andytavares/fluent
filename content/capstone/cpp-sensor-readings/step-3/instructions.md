# Step 3 — GET /sensors/:name/latest

Now that readings can be recorded, add a read path. This is the first
endpoint that reads existing rows rather than writing new ones — the
fixtures loaded for this step already contain readings to fetch.

## The task

Add a handler for `GET /sensors/:name/latest` that fetches the most recent
reading for a named sensor.

**Sample request/response (found):**

```
GET /sensors/temp-1/latest

200 OK
Content-Type: application/json

{"id":2,"sensor":"temp-1","value_milli":22000,"taken_at":"2026-07-01T10:00:00Z"}
```

**Sample request/response (not found):**

```
GET /sensors/temp-99/latest

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- The path segment between `/sensors/` and `/latest` is the sensor name —
  it's an arbitrary string, not an id, so no numeric parsing is needed
  here (unlike the CRUD capstones' `/:id` routes).
- Query the single most recent row for that sensor with
  `ORDER BY taken_at DESC LIMIT 1`. Use `PQexecParams` with a `$1`
  placeholder for the sensor name.
- Return `200` with the reading as JSON if at least one row exists for
  that sensor.
- Return `404` with body `{"error": "not found"}` if the sensor has no
  readings at all — check `PQntuples(result) == 0`.
- Reuse the same `PGconn*` connection you set up in Step 2.
