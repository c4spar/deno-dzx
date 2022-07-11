import { colors, shq } from "./deps.ts";
import { exec, statusOnly, stderrOnly, stdoutOnly } from "./exec.ts";

export type $ = typeof exec & typeof colors & {
  get mainModule(): string;
  get args(): Array<string>;
  get verbose(): number;
  set verbose(value: boolean | number);
  get startTime(): number;
  shell: string;
  prefix: string;
  stdin: NonNullable<Deno.RunOptions["stdin"]>;
  stdout: NonNullable<Deno.RunOptions["stdout"]>;
  stderr: NonNullable<Deno.RunOptions["stderr"]>;
  quote: typeof shq;
  throwErrors: boolean;
  time: number;
};

export const $: $ = exec as $;
export const $s: typeof statusOnly = statusOnly;
export const $o: typeof stdoutOnly = stdoutOnly;
export const $e: typeof stderrOnly = stderrOnly;

Object.setPrototypeOf($, Object.getPrototypeOf(colors));

$._stack = [];
$.shell = "/bin/bash";
$.prefix = "set -euo pipefail;";
$.stdin = "inherit";
$.stdout = "piped";
$.stderr = "piped";
$.quote = shq;
$.throwErrors = false;

let _verbose = 1;
Object.defineProperty($, "verbose", {
  get: (): number => _verbose,
  set: (verbose: boolean | number) => _verbose = Number(verbose),
});

Object.defineProperty($, "time", {
  get: () => Date.now() - $.startTime,
});
