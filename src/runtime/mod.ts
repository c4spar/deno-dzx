import { colors, flags, fs, io, log, path, shq } from "./deps.ts";
import { cd } from "./cd.ts";
import { exec } from "./exec.ts";
import { quote } from "./quote.ts";

export type $ = typeof exec & typeof colors & {
  verbose: boolean;
  cwd: string;
  shell: string;
  quote: typeof shq;
  throwErors: boolean;
};

export const $: $ = exec as $;

Object.setPrototypeOf($, Object.getPrototypeOf(colors));

$._stack = [];
$.shell = "/bin/sh";
$.verbose = false;
$.cwd = Deno.cwd();
$.quote = shq;
$.throwErors = false;

// dzx
self.$ = $;
self.cd = cd;
self.quote = quote;

// x
self.path = path;
self.io = io;
self.fs = fs;
self.log = log;
self.flags = flags;

export { cd, flags, fs, io, log, path, quote };
