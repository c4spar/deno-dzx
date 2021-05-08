import { colors, escapeStr } from "./deps.ts";
import { cd } from "./src/cd.ts";
import { exec } from "./src/exec.ts";
import { quote } from "./src/quote.ts";

export type $ = typeof exec & typeof colors & {
  verbose: boolean;
  cwd: string;
  shell: string;
  quote: typeof escapeStr;
};

export const $: $ = exec as $;

export { quote };

Object.setPrototypeOf($, Object.getPrototypeOf(colors));

$._stack = [];
$.shell = "/bin/sh";
$.verbose = false;
$.cwd = Deno.cwd();
$.quote = escapeStr;

export { cd };
