const assert = require("assert");
const { safeParseInt, safeJsonParse, retry } = require("./stub");

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

test("safeParseInt: valid",       () => assert.strictEqual(safeParseInt("42"),   42));
test("safeParseInt: negative",    () => assert.strictEqual(safeParseInt("-7"),   -7));
test("safeParseInt: zero",        () => assert.strictEqual(safeParseInt("0"),     0));
test("safeParseInt: float string",() => assert.strictEqual(safeParseInt("3.5"), null));
test("safeParseInt: letters",     () => assert.strictEqual(safeParseInt("abc"), null));
test("safeParseInt: empty",       () => assert.strictEqual(safeParseInt(""),    null));
test("safeParseInt: mixed",       () => assert.strictEqual(safeParseInt("12x"), null));

const ok = safeJsonParse('{"a":1}');
test("safeJsonParse: ok flag",  () => assert.strictEqual(ok.ok, true));
test("safeJsonParse: value",    () => assert.deepStrictEqual(ok.value, { a: 1 }));

const bad = safeJsonParse("{bad json}");
test("safeJsonParse: error flag",    () => assert.strictEqual(bad.ok, false));
test("safeJsonParse: error message", () => assert.ok(typeof bad.error === "string" && bad.error.length > 0));

// retry
let calls = 0;
const succeedOn3rd = () => {
  calls++;
  if (calls < 3) throw new Error("not yet");
  return "success";
};
test("retry: succeeds on 3rd attempt", () => {
  calls = 0;
  assert.strictEqual(retry(succeedOn3rd, 5), "success");
});
test("retry: call count is 3", () => assert.strictEqual(calls, 3));

test("retry: throws when all fail", () => {
  assert.throws(() => retry(() => { throw new Error("always fails"); }, 3), /always fails/);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
