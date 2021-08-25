/// <reference path="../../types.d.ts" />

import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";
import { quote } from "./quote.ts";

let runningProcesses = 0;

export async function exec(
  pieces: TemplateStringsArray,
  ...args: Array<string | number | ProcessOutput>
): Promise<ProcessOutput> {
  runningProcesses++;
  const cmd = quote(
    pieces,
    ...args.map((
      a,
    ) => (a instanceof ProcessOutput ? a.stdout.replace(/\n$/, "") : a)),
  );

  if ($.verbose) {
    console.log($.brightBlue("$ %s"), cmd);
  }

  const stdout: Array<string> = [];
  const stderr: Array<string> = [];
  const combined: Array<string> = [];
  const process = Deno.run({
    cmd: [$.shell, "-c", $.prefix + " " + cmd],
    env: Deno.env.toObject(),
    stdout: $.stdout,
    stderr: $.stderr,
  });

  const [status] = await Promise.all([
    process.status(),
    process.stdout && read(process.stdout, stdout, combined),
    process.stderr && read(process.stderr, stderr, combined),
  ]);

  process.stdout?.close();
  process.stderr?.close();
  process.close();

  if (--runningProcesses === 0) {
    $.stdout = "piped";
  }

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

/**
 * Run a command and return only its exit code
 *
 * If the command throws an error or fails in some way,
 * this method will not re-throw that error. It will
 * either return the exit code from the process, or `1`
 * if no exit code is produced (due to an error)
 *
 * If you want assurance that a failure in the child process
 * will throw an error, use `$`
 * @see $
 */
export const statusOnly = async (
  pieces: TemplateStringsArray,
  ...args: Array<string | number | ProcessOutput>
): Promise<number> =>
  await exec(pieces, ...args)
    .then((o) => (o instanceof ProcessOutput ? o.status.code : 0))
    .catch((e) => (e instanceof ProcessError ? e.status.code : 1));

/**
 * Run a command and return only its trimmed stdout
 *
 * If the command throws an error or fails in some way,
 * this method will not re-throw that error. It will only
 * have output if the command produces text written
 * to its stdout stream.
 *
 * If you want assurance that a failure in the child process
 * will throw an error, use `$`
 * @see $
 */
export const stdoutOnly = async (
  pieces: TemplateStringsArray,
  ...args: Array<string | number | ProcessOutput>
): Promise<string> =>
  await exec(pieces, ...args)
    .then((o) => (o instanceof ProcessOutput ? o.stdout.trim() : ""))
    .catch((e) => (e instanceof ProcessError ? e.stdout.trim() : ""));

/**
 * Run a command and return only its trimmed stderr
 *
 * If the command throws an error or fails in some way,
 * this method will not re-throw that error. It will only
 * have output if the command produces text written
 * to its stderr stream.
 *
 * If you want assurance that a failure in the child process
 * will throw an error, use `$`
 * @see $
 */
export const stderrOnly = async (
  pieces: TemplateStringsArray,
  ...args: Array<string | number | ProcessOutput>
): Promise<string> =>
  await exec(pieces, ...args)
    .then((o) => (o instanceof ProcessOutput ? o.stderr.trim() : ""))
    .catch((e) => (e instanceof ProcessError ? e.stderr.trim() : ""));

async function read(
  reader: Deno.Reader,
  ...results: Array<Array<string>>
) {
  for await (const chunk of io.iter(reader)) {
    const str = new TextDecoder().decode(chunk);
    for (const result of results) {
      result.push(str);
    }
  }
}
