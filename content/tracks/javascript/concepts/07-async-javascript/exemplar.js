function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchWithFallback(primaryFn, fallbackFn) {
  return primaryFn().catch(() => fallbackFn());
}

function runAll(tasks) {
  return Promise.all(tasks.map(t => t()));
}

async function retryAsync(fn, times) {
  let lastError;
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

module.exports = { delay, fetchWithFallback, runAll, retryAsync };
