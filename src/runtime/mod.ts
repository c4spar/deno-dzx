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
  shell: string;
  prefix: string;
  mainModule: string;
  get verbose(): number;
  set verbose(value: boolean | number);
  stdout: NonNullable<Deno.RunOptions["stdout"]>;
  stderr: NonNullable<Deno.RunOptions["stderr"]>;
  args: Array<string>;
  quote: typeof shq;
  throwErrors: boolean;
  startTime: number;
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
$.mainModule = Deno.mainModule;
$.stdout = "piped";
$.stderr = "piped";
$.args = [];
$.quote = shq;
$.throwErrors = false;
$.startTime = Date.now();

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
