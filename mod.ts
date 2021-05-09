import {
  colors,
  escapeStr,
  iter,
  iterSync,
  readAll,
  readAllSync,
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
  cd,
  iter,
  iterSync,
  parseFlags,
  quote,
  readAll,
  readAllSync,
  writeAll,
  writeAllSync,
};
