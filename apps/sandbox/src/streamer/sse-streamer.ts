import type { FastifyReply } from "fastify";
import { redis } from "../db/redis.js";

const STREAM_POLL_INTERVAL_MS = 200;
const STREAM_MAX_WAIT_MS = 60_000;

export async function streamExecutionResult(
  jobId: string,
  reply: FastifyReply,
): Promise<void> {
  const streamKey = `result:${jobId}`;

  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.raw.flushHeaders();

  const send = (event: string, data: unknown) => {
    reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const deadline = Date.now() + STREAM_MAX_WAIT_MS;
  let lastId = "0";

  while (Date.now() < deadline) {
    const entries = await redis.xread("COUNT", 100, "STREAMS", streamKey, lastId);

    if (entries && entries.length > 0) {
      const [, messages] = entries[0]!;
      for (const [id, fields] of messages) {
        lastId = id;
        const obj: Record<string, string> = {};
        for (let i = 0; i < fields.length; i += 2) {
          obj[fields[i]!] = fields[i + 1]!;
        }

        if (obj["type"] === "stdout") {
          send("stdout", { data: obj["data"] });
        } else if (obj["type"] === "stderr") {
          send("stderr", { data: obj["data"] });
        } else if (obj["type"] === "trace") {
          send("trace", { frames: obj["data"] ? JSON.parse(obj["data"]) : [] });
        } else if (obj["type"] === "result") {
          send("result", {
            exit_code: parseInt(obj["exit_code"] ?? "-1", 10),
            runtime_ms: parseInt(obj["runtime_ms"] ?? "0", 10),
            timed_out: obj["timed_out"] === "true",
          });
          reply.raw.end();
          return;
        }
      }
    }

    await new Promise((r) => setTimeout(r, STREAM_POLL_INTERVAL_MS));
  }

  send("error", { message: "Stream timeout" });
  reply.raw.end();
}
