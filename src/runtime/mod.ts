import { async, colors, flags, fs, io, log, path, shq } from "./deps.ts";
import { cd } from "./cd.ts";
import { exec } from "./exec.ts";
import { quote } from "./quote.ts";

export type $ = typeof exec & typeof colors & {
  shell: string;
  mainModule: string;
  verbose: boolean;
  stdout: NonNullable<Deno.RunOptions["stdout"]>;
  stderr: NonNullable<Deno.RunOptions["stderr"]>;
  throwErrors: boolean;
  startTime: number;
  time: number;
  quote: typeof shq;
};

export const $: $ = exec as $;

Object.setPrototypeOf($, Object.getPrototypeOf(colors));

$._stack = [];
$.shell = "/bin/sh";
$.mainModule = "";
$.verbose = false;
$.stdout = "piped";
$.stderr = "piped";
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
