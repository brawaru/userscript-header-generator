import type { Maybe, NonNullable, Arrayed } from "../common/types";
import type { NonArray } from "../expanders";
import { formattedOrDefault } from "./format";

export class AssertionError extends Error {}

export function assert(
  condition: boolean,
  message?: Maybe<string>,
  ...messageOptions: unknown[]
): asserts condition {
  if (!condition) {
    throw new AssertionError(
      formattedOrDefault(message, messageOptions, "Assertion failed."),
    );
  }
}

export function assertNotNull<T>(
  value: T,
  message?: Maybe<string>,
  ...messageOptions: unknown[]
): asserts value is NonNullable<T> {
  if (value == null) {
    throw new AssertionError(
      formattedOrDefault(message, messageOptions, "Value cannot be null."),
    );
  }
}

export function assertIsArray<T>(
  value: T,
  message?: Maybe<string>,
  ...messageOptions: unknown[]
): asserts value is Arrayed<T> {
  if (!Array.isArray(value)) {
    throw new AssertionError(
      formattedOrDefault(message, messageOptions, "Value is not an array."),
    );
  }
}

export function assertNotArray<T>(
  value: T,
  message?: Maybe<string>,
  ...messageOptions: unknown[]
): asserts value is NonArray<T> {
  if (Array.isArray(value)) {
    throw new AssertionError(
      formattedOrDefault(message, messageOptions, "Value cannot be an array."),
    );
  }
}

export function assertRegExpNoMatch(
  regexp: RegExp,
  value: string,
  message?: Maybe<string>,
  ...messageOptions: unknown[]
) {
  if (regexp.test(value)) {
    throw new AssertionError(
      formattedOrDefault(
        message,
        messageOptions,
        'Value "%s" should not match regular expression %s.',
        [value, regexp],
      ),
    );
  }
}
