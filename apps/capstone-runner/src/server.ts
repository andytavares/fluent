import Fastify from "fastify";
import { parse } from "csv-parse/sync";
import { findSessionPod, execInPod, PodNotFoundError } from "./k8s.js";

// Small internal HTTP server (mirrors apps/sandbox's registerInternalRoutes
// style): not internet-facing, only called by apps/api over a private URL.
// Owns the two synchronous request/response operations that don't fit
// Temporal's fire-and-forget signal model — deploying learner code and
// running an ad-hoc SQL query — both scoped to a single session's own pod.

// Command-completion tags psql prints (unprefixed) for non-SELECT statements
// when neither -q nor tuples-only is set — confirmed against the official
// psql docs: with a real result set, --csv prints a CSV header + RFC4180
// rows; with no result set, only the server's completion tag prints.
const COMPLETION_TAG_RE = /^(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE|BEGIN|COMMIT|ROLLBACK|SET)\b/i;

export type QueryResult =
  | { kind: "rows"; columns: string[]; rows: string[][] }
  | { kind: "message"; message: string };

export function parseQueryOutput(stdout: string): QueryResult {
  const trimmed = stdout.trim();
  if (trimmed.length === 0) {
    return { kind: "message", message: "OK" };
  }
  if (COMPLETION_TAG_RE.test(trimmed)) {
    return { kind: "message", message: trimmed };
  }

  const records = parse(stdout, { skip_empty_lines: true }) as string[][];
  const [columns, ...rows] = records;
  return { kind: "rows", columns: columns ?? [], rows };
}

async function withSessionPod(
  sessionId: string,
  reply: { status(code: number): { send(body: unknown): void } },
  handler: (podName: string) => Promise<void>,
): Promise<void> {
  let podName: string;
  try {
    podName = await findSessionPod(sessionId);
  } catch (err) {
    if (err instanceof PodNotFoundError) {
      reply.status(404).send({ error: "session pod not found" });
      return;
    }
    throw err;
  }
  await handler(podName);
}

export function buildServer() {
  const app = Fastify({ logger: false });

  app.post("/sessions/:sessionId/deploy", async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const { code } = req.body as { code: string };

    await withSessionPod(sessionId, reply, async (podName) => {
      let deployResult;
      try {
        deployResult = await execInPod(podName, "app", ["sh", "-c", "cat > /code/main.go && touch /code/.deployed"], {
          stdin: code,
        });
      } catch (err) {
        void reply.status(500).send({ error: err instanceof Error ? err.message : String(err) });
        return;
      }
      if (deployResult.exitCode !== 0) {
        void reply.status(500).send({ error: deployResult.stderr || "deploy failed" });
        return;
      }

      // The run-loop polls /code/.deployed every 1s and needs a moment to
      // notice, kill the previous process, and start the new one.
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const logResult = await execInPod(podName, "app", ["cat", "/code/out.log"]);
      void reply.send({ compileLog: logResult.stdout });
    });
  });

  app.post("/sessions/:sessionId/query", async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const { sql } = req.body as { sql: string };

    await withSessionPod(sessionId, reply, async (podName) => {
      const result = await execInPod(podName, "postgres", [
        "sh",
        "-c",
        'PGPASSWORD="$POSTGRES_PASSWORD" exec psql -h localhost -U postgres -d capstone --csv -v ON_ERROR_STOP=1 -c "SET statement_timeout=10000; $1"',
        "sh",
        sql,
      ]);

      if (result.exitCode !== 0) {
        void reply.status(500).send({ error: result.stderr || "query failed" });
        return;
      }

      void reply.send(parseQueryOutput(result.stdout));
    });
  });

  return app;
}
