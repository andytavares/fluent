// Throwaway live end-to-end verification for the capstone rebuild — drives
// the REAL tRPC router against a REAL Temporal workflow, REAL K8s pod, and
// REAL Postgres (no mocks). Deleted after use; not part of the shipped code.
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

const STEP_1_2_3_SERVER = `package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"

	_ "github.com/jackc/pgx/v5/stdlib"
)

var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("pgx", os.Getenv("DATABASE_URL"))
	if err != nil {
		panic(err)
	}
	_, err = db.Exec(\`CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		email TEXT UNIQUE NOT NULL,
		created_at TIMESTAMPTZ DEFAULT NOW()
	)\`)
	if err != nil {
		panic(err)
	}

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	http.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		var body struct {
			Name  string \`json:"name"\`
			Email string \`json:"email"\`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" || body.Email == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		var id int
		var createdAt string
		err := db.QueryRow(
			"INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, created_at",
			body.Name, body.Email,
		).Scan(&id, &createdAt)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"id": id, "name": body.Name, "email": body.Email, "created_at": createdAt,
		})
	})

	http.HandleFunc("/users/", func(w http.ResponseWriter, r *http.Request) {
		idStr := strings.TrimPrefix(r.URL.Path, "/users/")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		var name, email, createdAt string
		err = db.QueryRow("SELECT name, email, created_at FROM users WHERE id = $1", id).Scan(&name, &email, &createdAt)
		if err == sql.ErrNoRows {
			w.WriteHeader(http.StatusNotFound)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{"error": "not found"})
			return
		}
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"id": id, "name": name, "email": email, "created_at": createdAt,
		})
	})

	http.ListenAndServe(":8080", nil)
}
`;

const BROKEN_SERVER = `package main

import "net/http"

func main() {
	// Deliberately wrong: /health returns 500, not 200.
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	})
	http.ListenAndServe(":8080", nil)
}
`;

async function main() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: "dev@fluent.local" } });
  const track = await prisma.track.findUniqueOrThrow({ where: { slug: "go" } });
  const api = caller(user.id);

  console.log("1. Ensuring enrollment + mastering all concepts (capstone prereq)...");
  let enrollment = await prisma.enrollment.findUnique({ where: { userId_trackId: { userId: user.id, trackId: track.id } } });
  if (!enrollment) {
    enrollment = await api.enrollments.createEnrollment({ trackId: track.id });
  }
  await api.enrollments.devMasterAll({ trackId: track.id });

  console.log("2. Creating capstone session (real Temporal workflow + real K8s Job)...");
  const session = await api.capstone.createSession({ enrollmentId: enrollment.id });
  console.log(`   session id: ${session.id}`);

  console.log("3. Waiting for the pod to provision (dbConnectionEncrypted set)...");
  let status;
  const deadline = Date.now() + 120_000;
  do {
    await sleep(3000);
    status = await api.capstone.getSessionStatus({ sessionId: session.id });
    process.stdout.write(".");
  } while (!status.dbConnectionEncrypted && Date.now() < deadline);
  console.log("");
  if (!status.dbConnectionEncrypted) throw new Error("Provisioning never completed within 120s");
  console.log("   ✓ provisioned");

  console.log("4. Deploying the real step 1/2/3 server...");
  const deploy1 = await api.capstone.deployCode({ sessionId: session.id, code: STEP_1_2_3_SERVER });
  console.log(`   compile log: ${deploy1.compileLog || "(empty — good, no errors)"}`);
  await sleep(2000);

  for (const stepNumber of [1, 2, 3]) {
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

  console.log("7. Testing the SQL query browser (non-SELECT)...");
  const insertResult = await api.capstone.runQuery({ sessionId: session.id, sql: "INSERT INTO users (name, email) VALUES ('Manual Test', 'manual@test.local');" });
  console.log(`   ${JSON.stringify(insertResult)}`);

  console.log("8. Deploying a DELIBERATELY BROKEN server (negative-path check)...");
  const deploy2 = await api.capstone.deployCode({ sessionId: session.id, code: BROKEN_SERVER });
  console.log(`   compile log: ${deploy2.compileLog || "(empty)"}`);
  await sleep(2000);
  await api.capstone.verifyStep({ sessionId: session.id, stepNumber: 1 });
  await sleep(5000);
  const afterBroken = await api.capstone.getSessionStatus({ sessionId: session.id });
  const stillOnlyOriginalCompletions = afterBroken.stepCompletions.filter((sc) => sc.stepNumber === 1).length;
  console.log(`   step-1 completions after re-verifying against a broken server: ${stillOnlyOriginalCompletions} (should still be exactly 1 — the ORIGINAL pass; a broken server must NOT add a new one)`);

  console.log("\nDone. Session id for manual cleanup if needed:", session.id);
}

main()
  .catch((err) => {
    console.error("E2E CHECK FAILED:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
