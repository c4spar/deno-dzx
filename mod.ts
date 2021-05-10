import { colors, flags, fs, io, log, path, shq } from "./deps.ts";
import { cd } from "./src/cd.ts";
import { exec } from "./src/exec.ts";
import { quote } from "./src/quote.ts";

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
window.$ = $;
window.cd = cd;
window.quote = quote;

// x
window.path = path;
window.io = io;
window.fs = fs;
window.log = log;
window.flags = flags;

export { cd, flags, fs, io, log, path, quote };
