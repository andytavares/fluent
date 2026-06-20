interface AppConfig {
  host: string;
  port: number;
}

interface AppConfig {
  timeout: number;
}

// createConfig returns an AppConfig object with all three fields.
export function createConfig(host: string, port: number, timeout: number): AppConfig {
  // TODO
  return null as any;
}

export namespace StringUtils {
  // truncate shortens s to max chars, appending "..." if it was shortened.
  export function truncate(s: string, max: number): string {
    // TODO
    return "";
  }

  // pad left-pads s to length using char (default " ").
  export function pad(s: string, length: number, char?: string): string {
    // TODO
    return "";
  }
}

export namespace MathUtils {
  // clamp constrains n to [min, max].
  export function clamp(n: number, min: number, max: number): number {
    // TODO
    return 0;
  }

  // lerp linearly interpolates between a and b by t.
  export function lerp(a: number, b: number, t: number): number {
    // TODO
    return 0;
  }
}
