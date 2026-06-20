const assert = require("assert");
const { delay, fetchWithFallback, runAll, retryAsync } = require("./stub");

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

async function runTests() {
  // delay
  await test("delay: resolves after ms", async () => {
    const start = Date.now();
    await delay(50);
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 40, `expected >= 40ms, got ${elapsed}ms`);
  });

  await test("delay: returns a Promise", () => {
    const result = delay(0);
    assert.ok(result instanceof Promise, "delay() should return a Promise");
    return result;
  });

  // fetchWithFallback
  await test("fetchWithFallback: primary succeeds", async () => {
    const val = await fetchWithFallback(
      () => Promise.resolve("primary"),
      () => Promise.resolve("fallback")
    );
    assert.strictEqual(val, "primary");
  });

  await test("fetchWithFallback: uses fallback on primary rejection", async () => {
    const val = await fetchWithFallback(
      () => Promise.reject(new Error("boom")),
      () => Promise.resolve("fallback")
    );
    assert.strictEqual(val, "fallback");
  });

  await test("fetchWithFallback: rejects if both fail", async () => {
    await assert.rejects(
      () => fetchWithFallback(
        () => Promise.reject(new Error("primary fail")),
        () => Promise.reject(new Error("fallback fail"))
      ),
      /fallback fail/
    );
  });

  // runAll
  await test("runAll: empty array resolves to []", async () => {
    const result = await runAll([]);
    assert.deepStrictEqual(result, []);
  });

  await test("runAll: runs all tasks concurrently", async () => {
    const order = [];
    const tasks = [
      async () => { order.push(1); return "a"; },
      async () => { order.push(2); return "b"; },
      async () => { order.push(3); return "c"; },
    ];
    const result = await runAll(tasks);
    assert.deepStrictEqual(result, ["a", "b", "c"]);
    assert.strictEqual(order.length, 3);
  });

  await test("runAll: rejects if any task rejects", async () => {
    await assert.rejects(
      () => runAll([
        () => Promise.resolve("ok"),
        () => Promise.reject(new Error("task failed")),
      ]),
      /task failed/
    );
  });

  // retryAsync
  await test("retryAsync: succeeds on first attempt", async () => {
    const result = await retryAsync(() => Promise.resolve(42), 3);
    assert.strictEqual(result, 42);
  });

  await test("retryAsync: succeeds on 3rd attempt", async () => {
    let calls = 0;
    const fn = () => {
      calls++;
      if (calls < 3) return Promise.reject(new Error("not yet"));
      return Promise.resolve("done");
    };
    const result = await retryAsync(fn, 5);
    assert.strictEqual(result, "done");
    assert.strictEqual(calls, 3);
  });

  await test("retryAsync: rejects after all attempts exhausted", async () => {
    let calls = 0;
    await assert.rejects(
      () => retryAsync(() => { calls++; return Promise.reject(new Error("always")); }, 3),
      /always/
    );
    assert.strictEqual(calls, 3);
  });

  await test("retryAsync: rejects with last error", async () => {
    let i = 0;
    await assert.rejects(
      () => retryAsync(() => Promise.reject(new Error(`attempt ${++i}`)), 3),
      /attempt 3/
    );
  });

  console.log(`\n${passed} passed, ${failed} failed`);
}

runTests().then(() => { if (failed > 0) process.exit(1); });
