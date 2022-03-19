import { error } from "../_utils.ts";
import { Command } from "./deps.ts";

export function replCommand() {
  return new Command<void>()
    .description("Start a dzx repl.")
    .option(
      "--compat",
      "Node compatibility mode. Currently only enables built-in node modules like 'fs' and globals like 'process'",
    )
    .option(
      "--inspect=<host:string>",
      "Activate inspector on host:port (default: 127.0.0.1:9229)",
    )
    .option(
      "--inspect-brk=<host:string>",
      "Activate inspector on host:port and break at start of user script",
    )
    .option("--no-check", "Skip type checking modules.")
    .useRawArgs()
    .action(
      async function (_: void, ...args: Array<string>) {
        if (["-h", "--help"].includes(args[0])) {
          this.showHelp();
          Deno.exit(0);
        }
        await repl(args);
      },
    );
}

export async function repl(
  args: Array<string>,
): Promise<void> {
  const p = Deno.run({
    cmd: [
      "deno",
      "repl",
      "--unstable", // dzx requires unstable
      "--eval",
      `import "${new URL(
        "../../mod.ts",
        import.meta.url,
      )}"; $.throwErrors = true;`,
      ...args.filter((e) => e !== "--eval"), // we already use eval, and it can only be used once
    ],
  });

  const { success } = await p.status();
  p.close();

  if (!success) {
    throw error(`Failed to start repl`);
  }
}
