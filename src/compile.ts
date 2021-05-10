import { prepareBundle } from "./bundle.ts";
import { error } from "./_utils.ts";

export async function compile(
  script: string,
  args: Array<string>,
  dzxModuleUrl: string,
): Promise<void> {
  const { tmpFile } = await prepareBundle(script, dzxModuleUrl);

  const p = Deno.run({
    cmd: [
      "deno",
      "compile",
      "--no-check",
      ...args.filter((arg) => arg !== "--no-check"),
      tmpFile,
    ],
  });

  const { success } = await p.status();
  p.close();

  if (!success) {
    error(`Failed to compile: ${script}`);
  }
}
