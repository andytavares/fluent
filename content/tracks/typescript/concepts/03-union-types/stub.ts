export type Result<T> =
  | { ok: true;  value: T }
  | { ok: false; error: string };

// ok wraps a success value in a Result.
export function ok<T>(value: T): Result<T> {
  // TODO
  return { ok: true, value };
}

// err wraps an error message in a Result.
export function err<T>(message: string): Result<T> {
  // TODO
  return { ok: false, error: "" };
}

// map applies fn to the value if ok, or passes the error through.
export function map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
  // TODO
  return result as unknown as Result<U>;
}

// unwrap returns the value if ok, or throws with the error message.
export function unwrap<T>(result: Result<T>): T {
  // TODO
  throw new Error("not implemented");
}
