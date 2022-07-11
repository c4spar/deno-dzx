import { VERSION } from "../../version.ts";
import { path } from "../runtime/mod.ts";
import { bundleCommand } from "./bundle.ts";
import { compileCommand } from "./compile.ts";
import { Command, DenoLandProvider, UpgradeCommand } from "./deps.ts";
import { addProtocol } from "../_utils.ts";
import { evalCommand } from "./eval.ts";
import { importModule } from "./lib/bootstrap.ts";
import { getModuleFromStdin } from "./lib/stream.ts";
import { getMarkdownModule } from "./lib/markdown.ts";
import { spawnWorker } from "./lib/worker.ts";
import { repl, replCommand } from "./repl.ts";
import { initGlobals } from "../runtime/globals.ts";

export function dzx() {
  initGlobals();

  return new Command()
    .version(VERSION)
    .name("dzx")
    .description("A custom deno runtime for fun.")
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
      "--compat",
      "Node compatibility mode. Currently only enables built-in node modules like 'fs' and globals like 'process'.",
    )
    .option(
      "--inspect <host:string>",
      "Activate inspector on host:port. (default: 127.0.0.1:9229)",
    )
    .option(
      "--inspect-brk <host:string>",
      "Activate inspector on host:port and break at start of user script.",
    )
    .option(
      "-w, --worker",
      "Run script in an isolated web worker with it's own permissions. (experimental)",
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
    .option("--no-verbose", "Disable stdout output.")
    .stopEarly()
    .action(
      async (
        { worker, verbose, ...options },
        script?: string,
        args: Array<string> = [],
      ) => {
        if (!script && Deno.isatty(Deno.stdin.rid)) {
          await repl({ ...options, verbose });
          return;
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
            perms: options,
            mainModule,
            args,
            verbose,
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
