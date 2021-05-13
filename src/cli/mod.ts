import { VERSION } from "../../version.ts";
import { io, path } from "../runtime/mod.ts";
import { bundleCommand } from "./bundle.ts";
import { compileCommand } from "./compile.ts";
import { Command, ValidationError } from "./deps.ts";

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
    .option<{ allowPlugin?: boolean }>(
      "--allow-plugin",
      "Allow loading plugins.",
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
        _args?: Array<string>,
      ) => {
        if (script) {
          $.mainModule = addProtocool(script);
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
    .command("compile", compileCommand());

  function spawnWorker(perms: Permissions): void {
    new Worker(
      `data:application/typescript,${
        encodeURIComponent(`
          import "${new URL("./src/runtime/mod.ts", Deno.mainModule)}";
          $.mainModule = "${$.mainModule}";
          $.startTime = ${$.startTime};
          await import("${$.mainModule}");
          if ($.verbose) {
            const end = Date.now();
            console.log($.bold("time: %ss"), Math.round($.time) / 1000);
          }
          self.close();`)
      }`,
      {
        name: $.mainModule,
        type: "module",
        deno: {
          namespace: true,
          permissions: {
            env: perms.allowAll || perms.allowEnv,
            hrtime: perms.allowAll || perms.allowHrtime,
            plugin: perms.allowAll || perms.allowPlugin,
            run: perms.allowAll || perms.allowRun,
            write: perms.allowAll || perms.allowWrite,
            net: perms.allowAll || perms.allowNet,
            read: perms.allowAll || perms.allowRead,
          },
        },
      },
    );
  }

  async function importFromStdin(): Promise<void> {
    const data = new TextDecoder().decode(await io.readAll(Deno.stdin));
    if (data) {
      $.mainModule = `data:application/typescript,${encodeURIComponent(data)}`;
      await import($.mainModule);
    } else {
      // @TODO: add support for exit code in ValidationError
      // throw new ValidationError(`Failed to read from stdin.`, 2);
      throw new ValidationError(`Failed to read from stdin.`);
    }
  }

  function addProtocool(script: string): string {
    const hasProtocol: boolean = script.startsWith("http://") ||
      script.startsWith("https://") || script.startsWith("file://");
    if (!hasProtocol) {
      script = "file://" +
        (path.isAbsolute(script) ? script : path.join(Deno.cwd(), script));
    }
    return script;
  }
}

interface Permissions {
  allowAll?: boolean;
  allowEnv?: boolean;
  allowHrtime?: boolean;
  allowPlugin?: boolean;
  allowRun?: boolean;
  allowWrite?: boolean;
  allowNet?: boolean;
  allowRead?: boolean;
}
