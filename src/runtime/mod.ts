/// <reference path="../../types.d.ts" />

import {
  async,
  colors,
  flags,
  fs,
  io,
  log,
  path,
  shq,
  streams,
} from "./deps.ts";
import { cd } from "./cd.ts";
import { exec, statusOnly, stderrOnly, stdoutOnly } from "./exec.ts";
import { quote } from "./quote.ts";

export { ProcessError } from "./process_error.ts";
export { ProcessOutput } from "./process_output.ts";

export type $ = typeof exec & typeof colors & {
  get mainModule(): string;
  get args(): Array<string>;
  get verbose(): number;
  set verbose(value: boolean | number);
  get startTime(): number;
  shell: string;
  prefix: string;
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

// dzx
self.$ = $;
self.$s = $s;
self.$o = $o;
self.$e = $e;
self.cd = cd;
self.quote = quote;

// x
self.async = async;
self.path = path;
self.io = io;
self.streams = streams;
self.fs = fs;
self.log = log;
self.flags = flags;

export { async, cd, flags, fs, io, log, path, quote, streams };
