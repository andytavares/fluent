import Fastify from "fastify";
import { parse } from "csv-parse/sync";
import { findSessionPod, execInPod, PodNotFoundError } from "./k8s.js";
import { LANGUAGE_RUNTIMES } from "./language-runtimes.js";

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
    const { code, language } = req.body as { code: string; language: string };

    const runtime = LANGUAGE_RUNTIMES[language];
    if (!runtime) {
      void reply.status(400).send({ error: `unsupported language "${language}"` });
      return;
    }
    const entrypointPath = `/code/${runtime.entrypointFilename}`;

    await withSessionPod(sessionId, reply, async (podName) => {
      let deployResult;
      try {
        // The code travels as a positional argv element ($1), not stdin —
        // execInPod deliberately has no stdin (see k8s.ts) — and not
        // interpolated into the script text (shell-injection safety, same
        // pattern as the query route). printf '%s' writes it verbatim.
        deployResult = await execInPod(podName, "app", [
          "sh",
          "-c",
          `mkdir -p "$(dirname ${entrypointPath})" && printf '%s' "$1" > ${entrypointPath} && touch /code/.deployed`,
          "sh",
          code,
        ]);
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
      // The statement timeout is applied via PGOPTIONS at connection startup,
      // not a `SET ...;` prefix on the query text — a prefixed SET emits its
      // own completion tag ("SET") ahead of the real query's output, which
      // parseQueryOutput's leading-completion-tag check would then treat as
      // the entire response, discarding any actual result rows.
      const result = await execInPod(podName, "postgres", [
        "sh",
        "-c",
        'PGPASSWORD="$POSTGRES_PASSWORD" PGOPTIONS="-c statement_timeout=10000" exec psql -h localhost -U postgres -d capstone --csv -v ON_ERROR_STOP=1 -c "$1"',
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
