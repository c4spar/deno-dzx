import { preBundle } from "./bundle.ts";
import { error } from "../_utils.ts";
import { Command, copy, ValidationError } from "./deps.ts";

export function compileCommand() {
  return new Command<void>()
    .description("Combile an dzx script to a standalone binary.")
    .arguments("[script:string] [compile-options...:string[]]")
    .option("-A, --allow-all", "Allow all permissions.")
    .option("--allow-env [allow-env:string]", "Allow environment access.")
    .option("--allow-hrtime", "Allow high resolution time measurement.")
    .option("--allow-net [allow-net:string]", "Allow network access.")
    .option("--allow-ffi", "Allow loading dynamic libraries.")
    .option(
      "--allow-read [allow-read:string]",
      "Allow file system read access.",
    )
    .option(
      "--allow-run [allow-run:string]",
      "Allow running subprocesses.",
    )
    .option(
      "--allow-write [allow-write:string]",
      "Allow file system write access.",
    )
    .option("--no-check", "Skip type checking modules.")
    .option("--lite", "Use lite deno runtime.")
    .option("--unstable", "Enable unstable features and APIs of Deno.")
    .useRawArgs()
    .action(
      async function (_: void, script?: string, ...args: Array<string>) {
        if (script && args[0]?.[0] === "-") {
          args = [script, ...args];
          script = args.pop();
        }
        if (!script) {
          if (Deno.isatty(Deno.stdin.rid)) {
            throw new ValidationError(`Missing argument(s): script`);
          }
          script = await Deno.makeTempFile();
          const tmpFile = await Deno.open(script);
          await copy(Deno.stdin, tmpFile);
        }
        if (["-h", "--help"].includes(script)) {
          this.showHelp();
          Deno.exit(0);
        } else {
          await compile(
            script,
            args,
          );
        }
      },
    );
}

export async function compile(
  script: string,
  args: Array<string>,
): Promise<void> {
  const tmpFile = await preBundle(script);

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
    throw error(`Failed to compile: ${script}`);
  }
}
