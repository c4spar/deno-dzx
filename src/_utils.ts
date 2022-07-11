import { colors, path } from "./runtime/deps.ts";

export interface DzxErrorOptions {
  // deno-lint-ignore ban-types
  context?: Function;
}
export function createError(
  message: string | Error,
  { context }: DzxErrorOptions = {},
): Error {
  const err = message instanceof Error
    ? message
    : new Error(colors.red(message));

  if (context) {
    Error.captureStackTrace(err, context);
  }

  return err;
}

export function addProtocol(script: string): string {
  const hasProtocol: boolean = script.startsWith("http://") ||
    script.startsWith("https://") || script.startsWith("file://");
  if (!hasProtocol) {
    script = "file://" +
      (path.isAbsolute(script) ? script : path.join(Deno.cwd(), script));
  }
  return script;
}
