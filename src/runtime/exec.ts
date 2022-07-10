/// <reference path="../../types.d.ts" />

import { Process } from "./process.ts";
import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";
import { quote } from "./quote.ts";

let runningProcesses = 0;

export function exec(
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

  return new Process(cmd);
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
