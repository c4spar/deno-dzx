import { escape, iter } from "../deps.ts";
import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";

export async function exec(
  pieces: TemplateStringsArray,
  ...args: Array<string | number>
): Promise<ProcessOutput> {
  let cmd = pieces[0];
  let i = 0;
  for (; i < args.length; i++) {
    if (typeof args[i] === "string") {
      cmd += escape(args[i] as string) + pieces[i + 1];
    } else {
      cmd += args[i] + pieces[i + 1];
    }
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
