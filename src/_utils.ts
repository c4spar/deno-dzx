import { path } from "./runtime/deps.ts";

export function error(message: string | Error, exitCode = 1): Error {
  if ($.throwErrors) {
    return (message instanceof Error
      ? message
      : new Error(getErrorMessage(message)));
  }
  console.error(message instanceof Error ? message : getErrorMessage(message));
  Deno.exit(exitCode);
}

function getErrorMessage(message: string) {
  return $.red(`${$.bold("error:")} ${message}`);
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
