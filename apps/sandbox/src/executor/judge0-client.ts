import { fetch } from "undici";

const JUDGE0_URL = process.env["JUDGE0_URL"] ?? "http://localhost:2358";

// Go language ID in Judge0 (id 60 = Go 1.13.5 in this instance)
const GO_LANGUAGE_ID = 60;

interface SubmissionResult {
  stdout: string | null;
  stderr: string | null;
  exitCode: number | null;
  runtimeMs: number | null;
  timedOut: boolean;
  status: { id: number; description: string };
}

export class Judge0Client {
  async submit(code: string, language: string, timeoutMs = 10000): Promise<string> {
    const languageId = language === "go" ? GO_LANGUAGE_ID : GO_LANGUAGE_ID;
    const encoded = Buffer.from(code).toString("base64");

    const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: encoded,
        language_id: languageId,
        cpu_time_limit: timeoutMs / 1000,
        wall_time_limit: timeoutMs / 1000 + 1,
      }),
    });

    if (!res.ok) {
      throw new Error(`Judge0 submit failed: ${res.status}`);
    }

    const data = (await res.json()) as { token: string };
    return data.token;
  }

  async poll(token: string): Promise<SubmissionResult | null> {
    const res = await fetch(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,exit_code,time,status`,
    );

    if (!res.ok) {
      throw new Error(`Judge0 poll failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      status: { id: number; description: string };
      stdout: string | null;
      stderr: string | null;
      exit_code: number | null;
      time: string | null;
    };

    // Status 1 = In Queue, 2 = Processing — not done yet
    if (data.status.id <= 2) return null;

    const stdout = data.stdout ? Buffer.from(data.stdout, "base64").toString("utf-8") : null;
    const stderr = data.stderr ? Buffer.from(data.stderr, "base64").toString("utf-8") : null;
    const runtimeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : null;
    const timedOut = data.status.id === 5; // Time Limit Exceeded

    return {
      stdout,
      stderr,
      exitCode: data.exit_code,
      runtimeMs,
      timedOut,
      status: data.status,
    };
  }

  async submitAndPoll(
    code: string,
    language: string,
    timeoutMs = 10000,
  ): Promise<SubmissionResult> {
    const token = await this.submit(code, language, timeoutMs);

    // Poll with exponential backoff, max 30 seconds
    const maxWait = 30000;
    const start = Date.now();
    let delay = 500;

    while (Date.now() - start < maxWait) {
      await new Promise((r) => setTimeout(r, delay));
      const result = await this.poll(token);
      if (result) return result;
      delay = Math.min(delay * 1.5, 2000);
    }

    throw new Error("Judge0 poll timeout after 30 seconds");
  }
}
