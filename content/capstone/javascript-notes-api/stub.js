const http = require("http");
// TODO: connect to Postgres using the DATABASE_URL environment variable via
// the `pg` package (pre-fetched into your session):
//
//   const { Client } = require("pg");
//   const client = new Client({ connectionString: process.env.DATABASE_URL });
//   await client.connect();
//
// TODO: create the `notes` table on startup if it doesn't already exist.

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/notes") {
    // TODO: read the body, validate `title`, insert the row, return 201.
    sendJson(res, 400, { error: "not implemented" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/notes") {
    // TODO: list notes — support ?tag=, ?q=, ?page=, ?limit=.
    sendJson(res, 200, { notes: [], total: 0, page: 1, limit: 10 });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/notes/")) {
    // TODO: fetch a single note by id.
    sendJson(res, 404, { error: "not found" });
    return;
  }

  if (req.method === "PUT" && url.pathname.startsWith("/notes/")) {
    // TODO: partially update a note by id.
    sendJson(res, 404, { error: "not found" });
    return;
  }

  sendJson(res, 404, { error: "not found" });
});

server.listen(8080);
