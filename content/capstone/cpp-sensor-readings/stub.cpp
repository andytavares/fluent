// Build your C++ Sensor Readings API here.
// Listen on :8080 and read DATABASE_URL from your environment.
//
// TODO: connect to Postgres using libpq's PQconnectdb — it accepts the
// postgresql://user:pass@host/db URI in DATABASE_URL directly:
//
//   #include <libpq-fe.h>
//   PGconn *conn = PQconnectdb(getenv("DATABASE_URL"));
//
// TODO: create the `readings` table on startup if it doesn't already exist.
// TODO: build a raw-socket accept loop (socket/bind/listen/accept) and hand
// -parse just enough of HTTP/1.1 to route: GET /health, POST /readings,
// GET /sensors/:name/latest, GET /sensors/:name/stats, DELETE /sensors/:name,
// GET /sensors.

#include <cstdio>

int main() {
  // TODO: replace this with your accept loop listening on 0.0.0.0:8080.
  std::printf("listening on :8080\n");
  return 0;
}
