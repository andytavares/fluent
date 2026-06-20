// Flatten: if T is an array, returns the element type; otherwise returns T.
export type Flatten<T> = T extends Array<infer Item> ? Item : T;

// NonNullish: removes null and undefined from T.
export type NonNullish<T> = T extends null | undefined ? never : T;

// pick returns a new object containing only the specified keys.
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  // TODO
  return {} as Pick<T, K>;
}

// omit returns a new object with the specified keys removed.
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  // TODO
  return {} as Omit<T, K>;
}

// mapValues applies fn to every value in obj, preserving keys.
export function mapValues<T extends object, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U,
): Record<keyof T, U> {
  // TODO
  return {} as Record<keyof T, U>;
}

// partialUpdate returns a new object merging patch over target (shallow, no mutation).
export function partialUpdate<T extends object>(target: T, patch: Partial<T>): T {
  // TODO
  return target;
}
