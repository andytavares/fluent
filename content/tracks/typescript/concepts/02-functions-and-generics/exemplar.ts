export function identity<T>(value: T): T {
  return value;
}

export function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

export function zip<A, B>(as: A[], bs: B[]): [A, B][] {
  const len = Math.min(as.length, bs.length);
  return Array.from({ length: len }, (_, i) => [as[i], bs[i]]);
}
