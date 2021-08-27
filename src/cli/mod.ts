import { VERSION } from "../../version.ts";
import { $, io, path } from "../runtime/mod.ts";
import { bundleCommand } from "./bundle.ts";
import { compileCommand } from "./compile.ts";
import {
  Command,
  DenoLandProvider,
  tokens,
  UpgradeCommand,
  ValidationError,
} from "./deps.ts";

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
            ? addProtocool(await moduleFromMarkdown(script))
            : addProtocool(script);

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

  async function moduleFromMarkdown(md: string) {
    let mdRealPath;
    let mdContent;

    if (
      md.startsWith("http://") ||
      md.startsWith("https://")
    ) {
      mdContent = await fetch(md).then((r) => r.text());
      mdRealPath = await Deno.makeTempFile({
        prefix: "dzx_",
        suffix: `_source.md`,
      });

      await Deno.writeTextFile(mdRealPath, mdContent);

      console.error($.dim(`Markdown source saved to ${mdRealPath}`));
    }

    mdRealPath ??= await Deno.realPath(md);
    mdContent ??= await Deno.readTextFile(mdRealPath);
    const mdFileURL = path.toFileUrl(await Deno.realPath(mdRealPath));
    const mdTokens = tokens(mdContent);

    const validLangs = ["js", "javascript", "ts", "typescript"];
    const codeContent: string[] = [];

    mdTokens.forEach((token, idx) => {
      if (
        token.type === "start" && token.tag === "codeBlock" &&
        token.kind === "fenced" &&
        validLangs
          .includes(token.language)
      ) {
        let cursor = idx + 1;

        while (mdTokens.at(cursor)?.type === "text") {
          const code = mdTokens.at(cursor);

          // Silly typescript, can't narrow this down based on
          // the while loop condition...ah well
          if (code?.type === "text") {
            codeContent.push(code.content);
          }

          cursor++;
        }
      }
    });

    const tmp = await Deno.makeTempFile({
      prefix: "dzx_",
      suffix: `_module.ts`,
    });

    console.error($.dim(`Markdown module saved to ${tmp}\n`));

    const finalCode = codeContent.join("").replaceAll(
      "import.meta.url",
      `\"${mdFileURL}\"`,
    );

    await Deno.writeTextFile(
      tmp,
      `#!/usr/bin/env dzx
       /// <reference path="https://deno.land/x/dzx@${VERSION}/types.d.ts" />
       // deno-lint-ignore-file

       ${finalCode}
      `,
    );

    return tmp;
  }

  function spawnWorker(perms: Permissions): void {
    new Worker(
      `data:application/typescript,${
        encodeURIComponent(`
          import "${new URL("./src/runtime/mod.ts", Deno.mainModule)}";
          $.mainModule = "${$.mainModule}";
          $.startTime = ${$.startTime};
          $.args = JSON.parse(decodeURIComponent("${
          encodeURIComponent(JSON.stringify($.args))
        }"));
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
            ffi: perms.allowAll || perms.allowFfi,
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
      throw new ValidationError(`Failed to read from stdin.`, { exitCode: 2 });
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
  allowEnv?: boolean | string[];
  allowHrtime?: boolean;
  allowFfi?: boolean;
  allowRun?: boolean | (string | URL)[];
  allowWrite?: boolean | (string | URL)[];
  allowNet?: boolean | string[];
  allowRead?: boolean | (string | URL)[];
}
