export type Flatten<T> = T extends Array<infer Item> ? Item : T;
export type NonNullish<T> = T extends null | undefined ? never : T;

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K>);
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const excluded = new Set(keys as PropertyKey[]);
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !excluded.has(k))
  ) as Omit<T, K>;
}

export function mapValues<T extends object, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> {
  return Object.fromEntries(
    (Object.entries(obj) as [keyof T, T[keyof T]][]).map(([k, v]) => [k, fn(v, k)])
  ) as Record<keyof T, U>;
}

export function partialUpdate<T extends object>(target: T, patch: Partial<T>): T {
  return { ...target, ...patch };
}
