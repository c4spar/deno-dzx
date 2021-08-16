/// <reference path="../../types.d.ts" />

import { async, colors, flags, fs, io, log, path, shq } from "./deps.ts";
import { cd } from "./cd.ts";
import { envExists, envMissing } from "./env.ts";
import { exec, statusOnly, stderrOnly, stdoutOnly } from "./exec.ts";
import { quote } from "./quote.ts";
import { homedir, username } from "../_utils.ts";

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
export const $s: typeof statusOnly = statusOnly;
export const $o: typeof stdoutOnly = stdoutOnly;
export const $e: typeof stderrOnly = stderrOnly;

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
self.$s = $s;
self.$o = $o;
self.$e = $e;
self.cd = cd;
self.quote = quote;

// x
self.async = async;
self.path = path;
self.io = io;
self.fs = fs;
self.log = log;
self.flags = flags;

// convenient env vars
self.HOME = homedir(false);
self.USER = username(false);

// numeric script args ($0 is supplied by $.mainModule)
[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((arg) => {
  Object.defineProperty(self, `$${arg}`, {
    get: () => $.args.at(arg - 1),
  });
});

export { async, cd, envExists, envMissing, flags, fs, io, log, path, quote };
