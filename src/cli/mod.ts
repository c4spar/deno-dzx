import { VERSION } from "../../version.ts";
import { $, io, path } from "../runtime/mod.ts";
import { bundleCommand } from "./bundle.ts";
import { compileCommand } from "./compile.ts";
import {
  Command,
  DenoLandProvider,
  UpgradeCommand,
  ValidationError,
} from "./deps.ts";
import { addProtocol } from "../_utils.ts";
import { getMarkdownModule } from "./markdown.ts";
import { spawnWorker } from "./worker.ts";

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
        $.args = args;
        if (script) {
          const scriptExt = path.extname(script);

          $.mainModule = [".md", ".markdown"].includes(scriptExt)
            ? await getMarkdownModule(script)
            : addProtocol(script);

          if (worker) {
            spawnWorker(perms);
          } else {
            await import($.mainModule);
          }
        } else if (Deno.isatty(Deno.stdin.rid)) {
          throw new ValidationError(`Missing argument(s): script`);
        } else {
          await importFromStdin();
        }
        if ($.verbose) {
          console.log($.bold("time: %ss"), Math.round($.time) / 1000);
        }
      },
    )
    .command("bundle", bundleCommand())
    .command("compile", compileCommand())
    .command(
      "upgrade",
      new UpgradeCommand({
        args: ["--allow-all", "--unstable"],
        provider: new DenoLandProvider(),
      }),
    );

  async function importFromStdin(): Promise<void> {
    const data = new TextDecoder().decode(await io.readAll(Deno.stdin));
    if (data) {
      $.mainModule = `data:application/typescript,${encodeURIComponent(data)}`;
      await import($.mainModule);
    } else {
      throw new ValidationError(`Failed to read from stdin.`, { exitCode: 2 });
    }
  }
}
