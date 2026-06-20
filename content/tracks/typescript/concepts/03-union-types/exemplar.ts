export type Result<T> =
  | { ok: true;  value: T }
  | { ok: false; error: string };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<T>(message: string): Result<T> {
  return { ok: false, error: message };
}

export function map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
  if (result.ok) return { ok: true, value: fn(result.value) };
  return result;
}

export function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.value;
  throw new Error(result.error);
}
