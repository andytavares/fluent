# Step 4 — GET /sensors/:name/stats

With single-reading lookups working, add an aggregation endpoint. This is
where storing values as integer milli-units pays off directly: SQL
aggregate functions over an `INTEGER` column are exact, so `MIN`/`MAX`/`AVG`
need no rounding-error hand-waving.

## The task

Add a handler for `GET /sensors/:name/stats` that returns summary
statistics across all of a sensor's readings.

**Sample request/response (found):**

```
GET /sensors/temp-1/stats

200 OK
Content-Type: application/json

{"sensor":"temp-1","count":3,"min_milli":20000,"max_milli":22000,"avg_milli":21000}
```

**Sample request/response (not found):**

```
GET /sensors/temp-99/stats

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Compute all four statistics in a single query:

  ```sql
  SELECT COUNT(*), MIN(value_milli), MAX(value_milli),
         ROUND(AVG(value_milli))::INTEGER
  FROM readings WHERE sensor = $1;
  ```

  `AVG()` over an `INTEGER` column returns a `numeric` (decimal) in
  Postgres — `ROUND(...)::INTEGER` collapses that back to a whole number
  of milli-units, which is what the JSON response expects for `avg_milli`.
- Return `404` with body `{"error": "not found"}` when the sensor has no
  readings at all. `COUNT(*)` over zero matching rows still returns a row
  (with `count = 0`), so check the count value itself, not
  `PQntuples(result)`, to decide whether the sensor exists.
- Reuse the same `PGconn*` connection and `PQexecParams` pattern from the
  earlier steps, with a `$1` placeholder for the sensor name.
