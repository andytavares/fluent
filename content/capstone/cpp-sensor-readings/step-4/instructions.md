# Step 4 — GET /sensors/:name/stats

This step adds an aggregation endpoint. Here the integer milli-units pay
off. SQL aggregate functions over an `INTEGER` column are exact, so `MIN`,
`MAX` and `AVG` have no float rounding error.

## The task

Add a handler for `GET /sensors/:name/stats`. It returns summary statistics
across all readings of one sensor.

**Sample request and response (found):**

```
GET /sensors/temp-1/stats

200 OK
Content-Type: application/json

{"sensor":"temp-1","count":3,
 "min_milli":20000,"max_milli":22000,
 "avg_milli":21000}
```

**Sample request and response (not found):**

```
GET /sensors/temp-99/stats

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Compute all four statistics in one query:

```sql
SELECT COUNT(*), MIN(value_milli),
       MAX(value_milli),
       ROUND(AVG(value_milli))::INTEGER
FROM readings WHERE sensor = $1;
```

- In Postgres, `AVG()` over an `INTEGER` column returns a `numeric`
  (decimal) value. `ROUND(...)::INTEGER` turns it back into a whole number
  of milli-units, which `avg_milli` in the JSON response expects.
- If the sensor has no readings, return `404` with body
  `{"error": "not found"}`. `COUNT(*)` over zero matching rows still
  returns one row, with `count = 0`. Check the count value, not
  `PQntuples(result)`.
- Reuse the `PGconn*` connection and the `PQexecParams` pattern from the
  earlier steps. Use a `$1` placeholder for the sensor name.
