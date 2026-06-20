import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const executionDuration = new Trend("execution_duration_ms", true);

export const options = {
  scenarios: {
    concurrent_runs: {
      executor: "constant-vus",
      vus: 50,
      duration: "60s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<10000"],
    errors: ["rate<0.05"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const USER_TOKEN = __ENV.USER_TOKEN || "test-token";

export default function () {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${USER_TOKEN}`,
    "x-user-id": "load-test-user",
  };

  const payload = JSON.stringify({
    source: "cGFja2FnZSBtYWluCgppbXBvcnQgImZtdCIKCmZ1bmMgbWFpbigpIHsKCWZtdC5QcmludGxuKCJIZWxsbywgV29ybGQhIikKfQo=",
    language_id: 95,
    stdin: "",
  });

  const start = Date.now();
  const res = http.post(`${BASE_URL}/trpc/submissions.createSubmission`, payload, { headers });
  const elapsed = Date.now() - start;

  const ok = check(res, {
    "status is 200": (r) => r.status === 200,
    "has streamToken": (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!body?.result?.data?.streamToken;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!ok);
  executionDuration.add(elapsed);

  sleep(1);
}
