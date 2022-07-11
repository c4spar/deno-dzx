import { colors, path } from "./runtime/deps.ts";

export function error(message: string | Error): Error {
  return (message instanceof Error
    ? message
    : new Error(getErrorMessage(message)));
}

function getErrorMessage(message: string) {
  return colors.red(`${colors.bold("error:")} ${message}`);
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
