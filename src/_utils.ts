import { colors, path } from "./runtime/deps.ts";

interface ErrorOptions {
  // deno-lint-ignore ban-types
  context?: Function;
}
export function error(
  message: string | Error,
  { context }: ErrorOptions = {},
): Error {
  const err =
    (message instanceof Error ? message : new Error(colors.red(message)));
  Error.captureStackTrace(err, context);
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
