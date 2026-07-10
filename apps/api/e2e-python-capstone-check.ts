// Throwaway live end-to-end verification for the per-language capstone work —
// drives the REAL tRPC router against a REAL Temporal workflow, REAL K8s pod
// (python:3.12-slim), and REAL Postgres (no mocks). Deleted after use.
import { prisma } from "./src/db/index.js";
import { appRouter } from "./src/router/index.js";

function caller(userId: string) {
  return appRouter.createCaller({
    req: {} as never,
    res: {} as never,
    db: prisma,
    session: {
      user: { id: userId, email: "dev@fluent.local" },
      expires: new Date(Date.now() + 86_400_000).toISOString(),
    } as never,
  });
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const PYTHON_STEP_1_2_SERVER = `
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

import psycopg

conn = psycopg.connect(os.environ["DATABASE_URL"], autocommit=True)
with conn.cursor() as cur:
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            body = json.dumps({"status": "ok"}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path != "/users":
            self.send_response(404)
            self.end_headers()
            return
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw)
        except Exception:
            data = {}
        name = data.get("name")
        email = data.get("email")
        if not name or not email:
            self.send_response(400)
            self.end_headers()
            return
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO users (name, email) VALUES (%s, %s) RETURNING id, name, email, created_at",
                (name, email),
            )
            row = cur.fetchone()
        body = json.dumps({
            "id": row[0], "name": row[1], "email": row[2], "created_at": row[3].isoformat()
        }).encode()
        self.send_response(201)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)

if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
`;

async function main() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: "dev@fluent.local" } });
  const track = await prisma.track.findUniqueOrThrow({ where: { slug: "python" } });
  const api = caller(user.id);

  console.log("1. Ensuring enrollment + mastering all concepts (capstone prereq)...");
  let enrollment = await prisma.enrollment.findUnique({ where: { userId_trackId: { userId: user.id, trackId: track.id } } });
  if (!enrollment) {
    enrollment = await api.enrollments.createEnrollment({ trackId: track.id });
  }
  await api.enrollments.devMasterAll({ trackId: track.id });

  console.log("2. Creating capstone session (real Temporal workflow + real K8s Job, python:3.12-slim)...");
  const session = await api.capstone.createSession({ enrollmentId: enrollment.id });
  console.log(`   session id: ${session.id}`);

  console.log("3. Waiting for the pod to provision (dbConnectionEncrypted set)...");
  let status;
  const deadline = Date.now() + 180_000;
  do {
    await sleep(3000);
    status = await api.capstone.getSessionStatus({ sessionId: session.id });
    process.stdout.write(".");
  } while (!status.dbConnectionEncrypted && Date.now() < deadline);
  console.log("");
  if (!status.dbConnectionEncrypted) throw new Error("Provisioning never completed within 180s");
  console.log("   ✓ provisioned");

  console.log("4. Deploying the real python step 1/2 server...");
  const deploy1 = await api.capstone.deployCode({ sessionId: session.id, code: PYTHON_STEP_1_2_SERVER });
  console.log(`   compile log: ${deploy1.compileLog || "(empty — good, no errors)"}`);
  console.log(`   complexity: ${JSON.stringify(deploy1.complexity)}`);
  await sleep(2000);

  for (const stepNumber of [1, 2]) {
    console.log(`5.${stepNumber}. Verifying step ${stepNumber}...`);
    await api.capstone.verifyStep({ sessionId: session.id, stepNumber });
    let completed = false;
    const stepDeadline = Date.now() + 20_000;
    while (Date.now() < stepDeadline) {
      await sleep(2000);
      status = await api.capstone.getSessionStatus({ sessionId: session.id });
      const completion = status.stepCompletions.find((sc) => sc.stepNumber === stepNumber);
      if (completion) {
        completed = true;
        console.log(`   ✓ PASSED — verificationResult: ${JSON.stringify(completion.verificationResult)}`);
        break;
      }
    }
    if (!completed) console.log(`   ✗ did not complete within 20s (either failed or still processing)`);
  }

  console.log("6. Testing the SQL query browser (SELECT)...");
  const selectResult = await api.capstone.runQuery({ sessionId: session.id, sql: "SELECT id, name, email FROM users ORDER BY id;" });
  console.log(`   ${JSON.stringify(selectResult)}`);

  console.log("7. Testing the SQL query browser (table listing, the exact query the sidebar uses)...");
  const tablesResult = await api.capstone.runQuery({
    sessionId: session.id,
    sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;",
  });
  console.log(`   ${JSON.stringify(tablesResult)}`);

  console.log("\nDone. Session id for manual cleanup if needed:", session.id);
}

main()
  .catch((err) => {
    console.error("E2E CHECK FAILED:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
