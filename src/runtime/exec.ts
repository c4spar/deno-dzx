/// <reference path="../../types.d.ts" />

import { ProcessOutput } from "./process_output.ts";
import { quote } from "./quote.ts";
import { Process } from "./process.ts";

export function exec(
  pieces: TemplateStringsArray,
  ...args: Array<string | number | ProcessOutput>
): Process {
  const cmd = quote(
    pieces,
    ...args.map((
      a,
    ) => (a instanceof ProcessOutput ? a.stdout.replace(/\n$/, "") : a)),
  );

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
export function statusOnly(
  pieces: TemplateStringsArray,
  ...args: Array<string | number | ProcessOutput>
): Promise<number> {
  return exec(pieces, ...args).statusCode;
}

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
export function stdoutOnly(
  pieces: TemplateStringsArray,
  ...args: Array<string | number | ProcessOutput>
): Promise<string> {
  return exec(pieces, ...args)
    .noThrow
    .stdout
    .then((output) => output.trim());
}

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
export function stderrOnly(
  pieces: TemplateStringsArray,
  ...args: Array<string | number | ProcessOutput>
): Promise<string> {
  return exec(pieces, ...args)
    .noThrow
    .stderr
    .then((output) => output.trim());
}
