/// <reference path="../../types.d.ts" />

import { Child } from "./child.ts";
import { Readable, Reader } from "./reader.ts";
import { ProcessOutput } from "./process_output.ts";
import { isTemplateStringArray, parseCmd } from "./lib/utils.ts";

export function spawnChild(
  cmd: TemplateStringsArray,
  ...args: Array<string | number | ProcessOutput>
): Child;
export function spawnChild(reader: Readable<unknown, unknown>): Reader;
export function spawnChild(
  cmd: TemplateStringsArray | Readable<unknown, unknown>,
  ...args: Array<string | number | ProcessOutput>
): Child | Reader {
  if (!isTemplateStringArray(cmd)) {
    return new Reader<string, undefined>(
      cmd instanceof ReadableStream
        ? cmd
        : cmd instanceof Deno.Child
        ? cmd.stdout
        : cmd.readable,
    );
  }

  return Child.spawn(parseCmd(cmd, ...args), {
    context: spawnChild,
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
export function statusOnly(
  pieces: TemplateStringsArray,
  ...args: Array<string | number | ProcessOutput>
): Promise<number> {
  return spawnChild(pieces, ...args).statusCode;
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
  return spawnChild(pieces, ...args)
    .noThrow
    .stdout
    .then((stdout) => stdout.trim());
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
  return spawnChild(pieces, ...args)
    .noThrow
    .stderr
    .then((stderr) => stderr.trim());
}
