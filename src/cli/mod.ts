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
import { importModule } from "./lib/bootstrap.ts";
import { getModuleFromStdin } from "./lib/stream.ts";
import { getMarkdownModule } from "./lib/markdown.ts";
import { spawnWorker } from "./lib/worker.ts";
import { replCommand } from "./repl.ts";

export function dzx() {
  return new Command<void>()
    .version(VERSION)
    .name("dzx")
    .description("🦕 A custom deno runtime for fun.")
    .stopEarly()
    .arguments<[script?: string, args?: Array<string>]>(
      "[script:string] [args...:string[]]",
    )
    .option<{ allowAll?: boolean }>(
      "-A, --allow-all",
      "Allow all permissions.",
      { depends: ["worker"] },
    )
    .option<{ allowEnv?: boolean }>(
      "--allow-env",
      "Allow environment access.",
      { depends: ["worker"] },
    )
    .option<{ allowHrtime?: boolean }>(
      "--allow-hrtime",
      "Allow high resolution time measurement.",
      { depends: ["worker"] },
    )
    .option<{ allowNet?: boolean }>(
      "--allow-net",
      "Allow network access.",
      { depends: ["worker"] },
    )
    .option<{ allowFfi?: boolean }>(
      "--allow-ffi",
      "Allow loading dynamic libraries.",
      { depends: ["worker"] },
    )
    .option<{ allowRead?: boolean }>(
      "--allow-read",
      "Allow file system read access.",
      { depends: ["worker"] },
    )
    .option<{ allowRun?: boolean }>(
      "--allow-run",
      "Allow running subprocesses.",
      { depends: ["worker"] },
    )
    .option<{ allowWrite?: boolean }>(
      "--allow-write",
      "Allow file system write access.",
      { depends: ["worker"] },
    )
    .option<{ worker?: boolean }>(
      "-w, --worker",
      "Run script in an isolated web worker with it's own permissions.",
    )
    .action(
      async (
        { worker, ...perms },
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
            startTime: $.startTime,
          });
        } else {
          await importModule({ mainModule, args });
        }
      },
    )
    .command("bundle", bundleCommand())
    .command("compile", compileCommand())
    .command("repl", replCommand())
    .command(
      "upgrade",
      new UpgradeCommand({
        args: ["--allow-all", "--unstable"],
        provider: new DenoLandProvider(),
      }),
    );
}
