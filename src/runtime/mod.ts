import { async, colors, flags, fs, io, log, path, shq } from "./deps.ts";
import { cd } from "./cd.ts";
import { exec } from "./exec.ts";
import { quote } from "./quote.ts";

export type $Global = typeof exec & typeof colors & {
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

export const $: $Global = exec as $Global;

Object.setPrototypeOf($, Object.getPrototypeOf(colors));

$._stack = [];
$.shell = "/bin/sh";
$.prefix = "set -eu;";
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

// x
self.async = async;
self.path = path;
self.io = io;
self.fs = fs;
self.log = log;
self.flags = flags;

export { async, cd, flags, fs, io, log, path, quote };
