// delay returns a Promise that resolves after ms milliseconds.
function delay(ms) {
  // TODO
  return Promise.resolve();
}

// fetchWithFallback calls primaryFn(); on rejection, calls fallbackFn().
function fetchWithFallback(primaryFn, fallbackFn) {
  // TODO
  return Promise.resolve(null);
}

// runAll runs all task functions concurrently and resolves with their values.
function runAll(tasks) {
  // TODO
  return Promise.resolve([]);
}

// retryAsync calls fn() up to `times` attempts, returning the first resolution.
function retryAsync(fn, times) {
  // TODO
  return fn();
}

module.exports = { delay, fetchWithFallback, runAll, retryAsync };

// Quick smoke-check — run with: node stub.js
if (require.main === module) {
  (async () => {
    const start = Date.now();
    await delay(50);
    console.log(`delay: ~${Date.now() - start}ms`);  // ~50ms

    const val = await fetchWithFallback(
      () => Promise.reject(new Error("primary failed")),
      () => Promise.resolve("fallback")
    );
    console.log(`fetchWithFallback: ${val}`); // "fallback"
  })();
}
