import { VERSION } from "../../version.ts";
import { error } from "../_utils.ts";
import { Command } from "./deps.ts";
import { bootstrap } from "./lib/bootstrap.ts";
import { generateFlags } from "./lib/flags.ts";

export function replCommand() {
  return new Command()
    .description("Start a dzx repl.")
    .option(
      "--compat",
      "Node compatibility mode. Currently only enables built-in node modules like 'fs' and globals like 'process'.",
    )
    .option(
      "--inspect [host]",
      "Activate inspector on host:port. (default: 127.0.0.1:9229)",
    )
    .option(
      "--inspect-brk [host]",
      "Activate inspector on host:port and break at start of user script.",
    )
    .option(
      "-v, --verbose",
      `
      Enable verbose mode. This option can appear up to three times.
      -v: Print executed commands and script execution time.
      -vv: Print also stdout and stderr.
      -vvv: Print internal debug information.
      `,
      {
        collect: true,
        default: 1,
        // deno-lint-ignore no-inferrable-types
        value: (_, previus: number = 0) => ++previus,
      },
    )
    .option("--check", "Type check modules.")
    .option("--no-check", "Skip type checking modules.")
    .action((options) => repl(options));
}

export type ReplOptions = {
  compat?: true;
  inspect?: true | string;
  inspectBrk?: true | string;
  check?: boolean;
  verbose?: boolean | number;
};

export async function repl(
  options: ReplOptions,
): Promise<void> {
  const runtime = bootstrap({
    verbose: options.verbose,
  });
  const cmd = [
    "deno",
    "repl",
    "--unstable", // dzx requires unstable
    "--eval",
    `${runtime}\nconsole.log("dzx ${VERSION}");`,
  ];

  const flags = generateFlags({
    compat: options.compat,
    inspect: options.inspect,
    inspectBrk: options.inspectBrk,
    check: options.check === false ? false : null,
  });

  if (flags) {
    cmd.push(flags);
  }

  const p = Deno.run({ cmd });
  const { success } = await p.status();
  p.close();

  if (!success) {
    throw error(`Failed to start repl`);
  }
}
