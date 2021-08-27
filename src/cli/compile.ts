import { preBundle } from "./bundle.ts";
import { error } from "../_utils.ts";
import { Command, copy, parse, ValidationError } from "./deps.ts";

export function compileCommand() {
  return new Command<void>()
    .description("Combile an dzx script to a standalone binary.")
    .arguments(
      "[compile-options...:string[]] [script:string] [script-options...:string[]]",
    )
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
    // @see https://github.com/denoland/deno/issues/10507
    // .option("--lite", "Use lite deno runtime.")
    .option("--unstable", "Enable unstable features and APIs of Deno.")
    .useRawArgs()
    .action(
      async function (_: void, ...args: Array<string>) {
        if (["-h", "--help"].includes(args[0])) {
          this.showHelp();
          Deno.exit(0);
        }

        const { script, compileArgs, scriptArgs } = await compileConfigFromArgs(
          args,
        );

        if (!script) {
          throw new ValidationError(`Missing argument(s): script`);
        }

        await compile(script, compileArgs, scriptArgs);
      },
    );
}

export async function compile(
  script: string,
  compileArgs: Array<string>,
  scriptArgs: Array<string>,
): Promise<void> {
  const tmpFile = await preBundle(script);

  const p = Deno.run({
    cmd: [
      "deno",
      "compile",
      "--no-check",
      ...compileArgs.filter((arg) => arg !== "--no-check"),
      tmpFile,
      ...scriptArgs,
    ],
  });

  const { success } = await p.status();
  p.close();

  if (!success) {
    throw error(`Failed to compile: ${script}`);
  }
}

async function compileConfigFromArgs(args: Array<string>) {
  let script: string;
  const compileArgs: Array<string> = [];
  const scriptArgs: Array<string> = [];

  if (Deno.isatty(Deno.stdin.rid)) {
    const parsedArgs = parse(args, {
      "--": true,
      boolean: [
        "A",
        "allow-all",
        "allow-ffi",
        "allow-hrtime",
        "check",
        "lite",
        "prompt",
        "unstable",
      ],
    });
    script = parsedArgs._[0] as string;

    const scriptIdx = args.findIndex((a) => a === script);

    if (scriptIdx > -1) {
      args.slice(0, scriptIdx).forEach((a) => compileArgs.push(a));
      args.slice(scriptIdx + 1).forEach((a) => scriptArgs.push(a));
    }
  } else {
    const doubleDashIdx = args.findIndex((a) => a === "--");

    if (doubleDashIdx > -1) {
      args.slice(0, doubleDashIdx).forEach((a) => compileArgs.push(a));
      args.slice(doubleDashIdx + 1).forEach((a) => scriptArgs.push(a));
    } else {
      args.forEach((a) => compileArgs.push(a));
    }

    script = await Deno.makeTempFile();
    const tmpFile = await Deno.open(script, { write: true });
    await copy(Deno.stdin, tmpFile);
    tmpFile.close();
  }

  return { script, compileArgs, scriptArgs };
}
