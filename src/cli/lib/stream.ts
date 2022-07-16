import { readAll, ValidationError } from "../deps.ts";
import { bootstrapScript } from "./bootstrap.ts";

export async function getModuleFromStdin(): Promise<string> {
  const code = new TextDecoder().decode(await readAll(Deno.stdin));
  if (!code) {
    throw new ValidationError(`Failed to read from stdin.`, { exitCode: 2 });
  }
  return bootstrapScript(code);
}
