import assert from "assert";
import { Direction, StatusCode, Color, directionLabel, isValidDirection, statusMessage, colorToHex } from "./stub";

let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e: any) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

// directionLabel
test("directionLabel: Up",    () => assert.strictEqual(directionLabel(Direction.Up),    "Up"));
test("directionLabel: Down",  () => assert.strictEqual(directionLabel(Direction.Down),  "Down"));
test("directionLabel: Left",  () => assert.strictEqual(directionLabel(Direction.Left),  "Left"));
test("directionLabel: Right", () => assert.strictEqual(directionLabel(Direction.Right), "Right"));

// isValidDirection
test("isValidDirection: 0 (Up)",    () => assert.strictEqual(isValidDirection(0),  true));
test("isValidDirection: 3 (Right)", () => assert.strictEqual(isValidDirection(3),  true));
test("isValidDirection: 99",        () => assert.strictEqual(isValidDirection(99), false));
test("isValidDirection: -1",        () => assert.strictEqual(isValidDirection(-1), false));

// statusMessage
test("statusMessage: 200", () => assert.strictEqual(statusMessage(StatusCode.OK),       "OK"));
test("statusMessage: 201", () => assert.strictEqual(statusMessage(StatusCode.Created),  "Created"));
test("statusMessage: 404", () => assert.strictEqual(statusMessage(StatusCode.NotFound), "Not Found"));

// colorToHex
test("colorToHex: Red",   () => assert.strictEqual(colorToHex(Color.Red),   "#ff0000"));
test("colorToHex: Green", () => assert.strictEqual(colorToHex(Color.Green), "#00ff00"));
test("colorToHex: Blue",  () => assert.strictEqual(colorToHex(Color.Blue),  "#0000ff"));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
