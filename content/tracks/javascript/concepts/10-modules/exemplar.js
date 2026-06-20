export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export const VERSION = "1.0.0";

export function createLogger(prefix) {
  return {
    log(msg)   { return `[${prefix}] ${msg}`; },
    error(msg) { return `[${prefix}][ERROR] ${msg}`; },
  };
}

export default { clamp, lerp, VERSION };
