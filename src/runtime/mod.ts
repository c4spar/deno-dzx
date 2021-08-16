/// <reference path="../../types.d.ts" />

import { async, colors, flags, fs, io, log, path, shq } from "./deps.ts";
import { cd } from "./cd.ts";
import { envExists, envMissing, HOME, USER } from "./env.ts";
import { exec } from "./exec.ts";
import { quote } from "./quote.ts";

export { ProcessError } from "./process_error.ts";
export { ProcessOutput } from "./process_output.ts";

export type $ = typeof exec & typeof colors & {
  shell: string;
  prefix: string;
  mainModule: string;
  verbose: boolean;
  stdout: NonNullable<Deno.RunOptions["stdout"]>;
  stderr: NonNullable<Deno.RunOptions["stderr"]>;
  args: Array<string>;
  quote: typeof shq;
  throwErrors: boolean;
  startTime: number;
  time: number;
};

export const $: $ = exec as $;

Object.setPrototypeOf($, Object.getPrototypeOf(colors));

$._stack = [];
$.shell = "/bin/bash";
$.prefix = "set -euo pipefail;";
$.mainModule = "";
$.verbose = false;
$.stdout = "piped";
$.stderr = "piped";
$.args = [];
$.quote = shq;
$.throwErrors = false;
$.startTime = Date.now();
Object.defineProperty($, "time", {
  get: () => Date.now() - $.startTime,
});

// dzx
self.$ = $;
self.cd = cd;
self.quote = quote;

self.HOME = HOME;
self.USER = USER;

// x
self.async = async;
self.path = path;
self.io = io;
self.fs = fs;
self.log = log;
self.flags = flags;

export {
  async,
  cd,
  envExists,
  envMissing,
  flags,
  fs,
  HOME,
  io,
  log,
  path,
  quote,
  USER,
};
