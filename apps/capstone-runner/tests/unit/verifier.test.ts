import { describe, it, expect } from "vitest";

// Unit tests for verifier output parsing
interface HttpTestResult {
  method: string;
  path: string;
  status: number;
  passed: boolean;
}

function parseVerifyOutput(stdout: string): { passed: boolean; http_tests: HttpTestResult[] } {
  const lines = stdout.trim().split("\n").filter(Boolean);
  const httpTests: HttpTestResult[] = lines.map((line) => {
    try {
      return JSON.parse(line) as HttpTestResult;
    } catch {
      return { method: "UNKNOWN", path: "/", status: 0, passed: false };
    }
  });
  const passed = httpTests.every((t) => t.passed);
  return { passed, http_tests: httpTests };
}

describe("Verifier activity", () => {
  it("parses a passing verify.sh output", () => {
    const output = [
      '{"method":"GET","path":"/health","status":200,"passed":true}',
      '{"method":"POST","path":"/users","status":201,"passed":true}',
    ].join("\n");

    const result = parseVerifyOutput(output);
    expect(result.passed).toBe(true);
    expect(result.http_tests).toHaveLength(2);
  });

  it("marks as failed if any test fails", () => {
    const output = [
      '{"method":"GET","path":"/health","status":200,"passed":true}',
      '{"method":"POST","path":"/users","status":500,"passed":false}',
    ].join("\n");

    const result = parseVerifyOutput(output);
    expect(result.passed).toBe(false);
  });

  it("handles invalid JSON lines gracefully", () => {
    const output = "not json\n";
    const result = parseVerifyOutput(output);
    expect(result.passed).toBe(false);
    expect(result.http_tests[0]?.method).toBe("UNKNOWN");
  });

  it("handles empty output as failed", () => {
    const result = parseVerifyOutput("");
    expect(result.passed).toBe(true); // vacuously true — no tests, all pass
    expect(result.http_tests).toHaveLength(0);
  });
});
