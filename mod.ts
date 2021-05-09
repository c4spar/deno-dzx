import {
  basename,
  Buffer,
  colors,
  dirname,
  escapeStr,
  extname,
  fromFileUrl,
  isAbsolute,
  iter,
  iterSync,
  join,
  normalize,
  readAll,
  readAllSync,
  readLines,
  relative,
  resolve,
  toFileUrl,
  toNamespacedPath,
  writeAll,
  writeAllSync,
} from "./deps.ts";
import { cd } from "./src/cd.ts";
import { exec } from "./src/exec.ts";
import { quote } from "./src/quote.ts";
import { parseFlags } from "./src/parse_flags.ts";

export type $ = typeof exec & typeof colors & {
  verbose: boolean;
  cwd: string;
  shell: string;
  quote: typeof escapeStr;
  throwErors: boolean;
};

export const $: $ = exec as $;

Object.setPrototypeOf($, Object.getPrototypeOf(colors));

$._stack = [];
$.shell = "/bin/sh";
$.verbose = false;
$.cwd = Deno.cwd();
$.quote = escapeStr;
$.throwErors = false;

export {
  basename,
  Buffer,
  cd,
  dirname,
  extname,
  fromFileUrl,
  isAbsolute,
  iter,
  iterSync,
  join,
  normalize,
  parseFlags,
  quote,
  readAll,
  readAllSync,
  readLines,
  relative,
  resolve,
  toFileUrl,
  toNamespacedPath,
  writeAll,
  writeAllSync,
};
