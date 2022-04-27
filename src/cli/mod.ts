import { VERSION } from "../../version.ts";
import { $, path } from "../runtime/mod.ts";
import { bundleCommand } from "./bundle.ts";
import { compileCommand } from "./compile.ts";
import {
  Command,
  DenoLandProvider,
  UpgradeCommand,
  ValidationError,
} from "./deps.ts";
import { addProtocol } from "../_utils.ts";
import { evalCommand } from "./eval.ts";
import { importModule } from "./lib/bootstrap.ts";
import { getModuleFromStdin } from "./lib/stream.ts";
import { getMarkdownModule } from "./lib/markdown.ts";
import { spawnWorker } from "./lib/worker.ts";
import { replCommand } from "./repl.ts";

export function dzx() {
  return new Command()
    .version(VERSION)
    .name("dzx")
    .description("🦕 A custom deno runtime for fun.")
    .arguments("[script:string] [args...:string]")
    .option(
      "-A, --allow-all",
      "Allow all permissions.",
      { depends: ["worker"] },
    )
    .option(
      "--allow-env",
      "Allow environment access.",
      { depends: ["worker"] },
    )
    .option(
      "--allow-hrtime",
      "Allow high resolution time measurement.",
      { depends: ["worker"] },
    )
    .option(
      "--allow-net",
      "Allow network access.",
      { depends: ["worker"] },
    )
    .option(
      "--allow-ffi",
      "Allow loading dynamic libraries.",
      { depends: ["worker"] },
    )
    .option(
      "--allow-read",
      "Allow file system read access.",
      { depends: ["worker"] },
    )
    .option(
      "--allow-run",
      "Allow running subprocesses.",
      { depends: ["worker"] },
    )
    .option(
      "--allow-write",
      "Allow file system write access.",
      { depends: ["worker"] },
    )
    .option(
      "-w, --worker",
      "Run script in an isolated web worker with it's own permissions.",
    )
    .option(
      "-v, --verbose",
      "Run script in verbose mode. This option can appear up to three times.\n" +
        "-v: Print executed commands and script execution time.\n" +
        "-vv: Print also stdout and stderr.\n" +
        "-vvv: Print internal debug information.",
      {
        collect: true,
        default: 1,
        // deno-lint-ignore no-inferrable-types
        value: (_, previus: number = 0) => ++previus,
      },
    )
    .option("--no-verbose", "Disable stdout output.")
    .stopEarly()
    .action(
      async (
        { worker, verbose, ...perms },
        script?: string,
        args: Array<string> = [],
      ) => {
        if (!script && Deno.isatty(Deno.stdin.rid)) {
          throw new ValidationError(`Missing argument(s): script`);
        }

        let mainModule: string;
        if (script) {
          const scriptExt = path.extname(script);
          mainModule = [".md", ".markdown"].includes(scriptExt)
            ? await getMarkdownModule(script)
            : addProtocol(script);
        } else {
          mainModule = await getModuleFromStdin();
        }

        if (worker) {
          spawnWorker({
            perms,
            mainModule,
            args,
            verbose,
            startTime: $.startTime,
          });
        } else {
          await importModule({ mainModule, args, verbose });
        }
      },
    )
    .command("bundle", bundleCommand())
    .command("compile", compileCommand())
    .command("eval", evalCommand())
    .command("repl", replCommand())
    .command(
      "upgrade",
      new UpgradeCommand({
        args: ["--allow-all", "--unstable"],
        provider: new DenoLandProvider(),
      }),
    );
}
