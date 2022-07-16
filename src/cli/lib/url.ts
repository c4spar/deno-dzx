import { isAbsolute, join } from "../deps.ts";

export function addProtocol(script: string): string {
  const hasProtocol: boolean = script.startsWith("http://") ||
    script.startsWith("https://") ||
    script.startsWith("file://");

  if (!hasProtocol) {
    const filePath = isAbsolute(script) ? script : join(Deno.cwd(), script);

    script = "file://" + filePath;
  }

  return script;
}
