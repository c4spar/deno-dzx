import { readAll } from "./deps.ts";
import { DZX } from "./types.d.ts";
import { colors, iter, join } from "./deps.ts";

async function main(): Promise<void> {
  const $: DZX = exec as DZX;

  Object.setPrototypeOf($, Object.getPrototypeOf(colors));
  $._stack = [];
  $.shell = "/bin/sh";
  $.verbose = false;
  $.cwd = Deno.cwd();
  $.cd = cd;

  window.$ = $;

  let script: string | undefined = Deno.args[0];

  try {
    if (!script) {
      if (!Deno.isatty(Deno.stdin.rid)) {
        script = new TextDecoder().decode(await readAll(Deno.stdin));
        if (script) {
          await import(
            `data:application/typescript,${encodeURIComponent(script)}`
          );
        } else {
          console.error(`usage: dzx <script>`);
          Deno.exit(2);
        }
      }
    } else if (script.startsWith("http://") || script.startsWith("https://")) {
      await import(script);
    } else if (script) {
      const data = await Deno.readTextFile(join($.cwd, script));
      await import(`data:application/typescript,${encodeURIComponent(data)}`);
    } else {
      console.error(`usage: dzx <script>`);
      Deno.exit(1);
    }
  } catch (error) {
    if (error instanceof ProcessError) {
      console.error(error);
    }
    throw error;
  }
}

export async function exec(
  pieces: TemplateStringsArray,
  ...args: Array<unknown>
): Promise<ProcessOutput> {
  let cmd = pieces[0], i = 0;
  for (; i < args.length; i++) {
    cmd += args[i] + pieces[i + 1];
  }
  for (++i; i < pieces.length; i++) {
    cmd += pieces[i];
  }

  if ($.verbose) {
    console.log($.brightBlue("$ %s"), cmd);
  }

  const stdout: Array<string> = [];
  const stderr: Array<string> = [];
  const combined: Array<string> = [];
  const process = Deno.run({
    cmd: [$.shell, "-c", cmd],
    cwd: $.cwd,
    env: Deno.env.toObject(),
    stdout: "piped",
    stderr: "piped",
  });

  const [status] = await Promise.all([
    process.status(),
    read(process.stdout, stdout, combined),
    read(process.stderr, stderr, combined),
  ]);

  if (status.success) {
    return new ProcessOutput({
      stdout: stdout.join(""),
      stderr: stderr.join(""),
      combined: combined.join(""),
      status,
    });
  }

  throw new ProcessError({
    stdout: stdout.join(""),
    stderr: stderr.join(""),
    combined: combined.join(""),
    status,
  });
}

export function cd(path: string) {
  if ($.verbose) {
    console.log($.brightBlue("$ %s"), `cd ${path}`);
  }

  try {
    Deno.lstatSync(path);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      const stack: string = (new Error().stack!.split("at ")[2]).trim();
      console.error(`cd: ${path}: No such directory`);
      console.error(`  at ${stack}`);
      Deno.exit(1);
    } else if (error instanceof Deno.errors.PermissionDenied) {
      const stack: string = (new Error().stack!.split("at ")[2]).trim();
      console.error(`cd: ${path}: Permission denied`);
      console.error(`  at ${stack}`);
      Deno.exit(1);
    }
    throw error;
  }

  $.cwd = path;
}

async function read(
  reader: Deno.Reader,
  ...results: Array<Array<string>>
) {
  for await (const chunk of iter(reader)) {
    const str = new TextDecoder().decode(chunk);
    for (const result of results) {
      result.push(str);
    }
  }
}

export interface ProcessOutputOptions {
  stdout: string;
  stderr: string;
  combined: string;
  status: Deno.ProcessStatus;
}

export class ProcessOutput {
  readonly stdout: string;
  readonly stderr: string;
  readonly combined: string;
  readonly status: Deno.ProcessStatus;

  constructor({ stdout, stderr, combined, status }: ProcessOutputOptions) {
    this.stdout = stdout;
    this.stderr = stderr;
    this.combined = combined;
    this.status = status;
  }

  toString(): string {
    return this.combined;
  }
}

export class ProcessError extends Error {
  readonly stdout: string;
  readonly stderr: string;
  readonly combined: string;
  readonly status: Deno.ProcessStatus;

  constructor({ stdout, stderr, combined, status }: ProcessOutputOptions) {
    super();
    Object.setPrototypeOf(this, ProcessError.prototype);
    this.stdout = stdout;
    this.stderr = stderr;
    this.combined = combined;
    this.status = status;
    this.message = combined;
  }
}

await main();
