import type { NonNullable } from "../common/types";

export function isNotNull<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export function forNonNullValueOf<T, R>(
  value: T,
  action: (value: NonNullable<T>) => R,
): [R, true] | [null, false] {
  if (isNotNull(value)) {
    return [action(value), true];
  }

  return [null, false];
}
