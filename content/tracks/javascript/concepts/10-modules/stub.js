// clamp constrains n to [min, max].
export function clamp(n, min, max) {
  // TODO
  return n;
}

// lerp linearly interpolates between a and b by t.
export function lerp(a, b, t) {
  // TODO
  return 0;
}

export const VERSION = "1.0.0";

// createLogger returns a logger object with log() and error() methods.
export function createLogger(prefix) {
  return {
    log(msg) {
      // TODO: return "[prefix] msg"
      return "";
    },
    error(msg) {
      // TODO: return "[prefix][ERROR] msg"
      return "";
    },
  };
}

export default { clamp, lerp, VERSION };
