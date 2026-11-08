# Step 3 — GET /sensors/:name/latest

This step adds a read path. It is the first endpoint that reads existing
rows instead of writing new ones. The fixtures for this step already
contain readings to fetch.

## The task

Add a handler for `GET /sensors/:name/latest`. It returns the most recent
reading for a named sensor.

**Sample request and response (found):**

```
GET /sensors/temp-1/latest

200 OK
Content-Type: application/json

{"id":2,"sensor":"temp-1",
 "value_milli":22000,
 "taken_at":"2026-07-01T10:00:00Z"}
```

**Sample request and response (not found):**

```
GET /sensors/temp-99/latest

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- The path segment between `/sensors/` and `/latest` is the sensor name. It
  is a string, not an id, so you do not parse a number. The `/:id` routes
  of the CRUD capstones are different.
- Query the most recent row for that sensor with
  `ORDER BY taken_at DESC LIMIT 1`. Use `PQexecParams` with a `$1`
  placeholder for the sensor name.
- If at least one row exists for the sensor, return `200` with the reading
  as JSON.
- If the sensor has no readings, return `404` with body
  `{"error": "not found"}`. Check `PQntuples(result) == 0`.
- Reuse the `PGconn*` connection from Step 2.
