interface AppConfig {
  host: string;
  port: number;
}

interface AppConfig {
  timeout: number;
}

export function createConfig(host: string, port: number, timeout: number): AppConfig {
  return { host, port, timeout };
}

export namespace StringUtils {
  export function truncate(s: string, max: number): string {
    return s.length <= max ? s : s.slice(0, max) + "...";
  }

  export function pad(s: string, length: number, char: string = " "): string {
    if (s.length >= length) return s;
    return char.repeat(length - s.length) + s;
  }
}

export namespace MathUtils {
  export function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
  }

  export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}
