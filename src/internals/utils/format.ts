import { format } from "util";
import type { Maybe } from "../common/types";
import { isNotNull } from "./checks";

export function formattedOrDefault(
  message: Maybe<string>,
  messageOptions: unknown[],
  defaultMessage: string,
  defaultMessageOptions?: Maybe<unknown[]>,
) {
  if (isNotNull(message)) {
    return format(message, ...messageOptions);
  } else {
    return isNotNull(defaultMessageOptions)
      ? format(message, ...defaultMessageOptions)
      : defaultMessage;
  }
}
