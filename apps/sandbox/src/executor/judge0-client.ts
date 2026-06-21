import { fetch } from "undici";

const JUDGE0_URL = process.env["JUDGE0_URL"] ?? "http://localhost:2358";

// Judge0 language IDs for this instance
const LANGUAGE_IDS: Record<string, number> = {
  go: 60,
  javascript: 63,
  typescript: 74,
  c: 50,        // GCC 9.2.0
  cpp: 54,      // GCC 9.2.0
  java: 62,
  elixir: 57,
  ruby: 72,
  python: 71,   // Python 3.8.1
  shell: 46,    // Bash 5.0.0
  assembly: 45, // NASM 2.14.02
  terraform: 46,
  helm: 46,
  kotlin: 78,
  rust: 73,
};

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
    const languageId = LANGUAGE_IDS[language] ?? LANGUAGE_IDS["go"]!;
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
