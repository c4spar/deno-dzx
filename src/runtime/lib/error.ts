import { red } from "../deps.ts";

export interface DzxErrorOptions {
  // deno-lint-ignore ban-types
  context?: Function;
}

export function createError(
  message: string | Error,
  { context }: DzxErrorOptions = {},
): Error {
  const err = message instanceof Error ? message : new Error(red(message));

  if (context) {
    Error.captureStackTrace(err, context);
  }

  return err;
}
