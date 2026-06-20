import assert from "assert";
import { createProduct, updateProduct, catalogEntry, type Product } from "./stub";

let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e: any) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

const draft = { name: "Widget", price: 9.99, category: "hardware", inStock: true };
const p: Product = createProduct(draft, 1);

test("createProduct: id set",       () => assert.strictEqual(p.id,       1));
test("createProduct: name",         () => assert.strictEqual(p.name,     "Widget"));
test("createProduct: price",        () => assert.strictEqual(p.price,    9.99));
test("createProduct: category",     () => assert.strictEqual(p.category, "hardware"));
test("createProduct: inStock",      () => assert.strictEqual(p.inStock,  true));

const patched = updateProduct(p, { price: 7.99, inStock: false });
test("updateProduct: price changed",    () => assert.strictEqual(patched.price,   7.99));
test("updateProduct: inStock changed",  () => assert.strictEqual(patched.inStock, false));
test("updateProduct: id preserved",     () => assert.strictEqual(patched.id,      1));
test("updateProduct: name unchanged",   () => assert.strictEqual(patched.name,    "Widget"));
test("updateProduct: original unchanged", () => assert.strictEqual(p.price,      9.99));

const entry = catalogEntry(p);
test("catalogEntry: has id",    () => assert.strictEqual(entry.id,    1));
test("catalogEntry: has name",  () => assert.strictEqual(entry.name,  "Widget"));
test("catalogEntry: has price", () => assert.strictEqual(entry.price, 9.99));
test("catalogEntry: no extra fields", () => {
  assert.strictEqual(Object.keys(entry).length, 3);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
