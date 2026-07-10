import json
import os
from datetime import date, datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

# TODO: connect to Postgres using the DATABASE_URL environment variable via
# psycopg (psycopg 3, pre-fetched into your session):
#
#   import psycopg
#   conn = psycopg.connect(os.environ["DATABASE_URL"], autocommit=True)
#
# TODO: create the `expenses` table on startup if it doesn't already exist.


def json_default(value):
    # date/datetime aren't JSON-serializable by default — this lets
    # json.dumps(..., default=json_default) handle spent_on/created_at.
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    raise TypeError(f"not serializable: {value!r}")


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload, default=json_default).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/health":
            self._send_json(200, {"status": "ok"})
            return

        # TODO: GET /reports/categories — category totals.
        # TODO: GET /reports/monthly?year=YYYY&month=MM — monthly report.
        # TODO: GET /expenses/:id — fetch a single expense.

        self._send_json(404, {"error": "not found"})

    def do_POST(self):
        if self.path == "/expenses":
            # TODO: read and parse the request body, validate required
            # fields, insert the row, and return 201 with the inserted row.
            self._send_json(400, {"error": "not implemented"})
            return

        self._send_json(404, {"error": "not found"})

    def do_DELETE(self):
        # TODO: DELETE /expenses/:id
        self._send_json(404, {"error": "not found"})


if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
