import { colors } from "./deps.ts";
import { cd } from "./src/cd.ts";
import { exec } from "./src/exec.ts";
import { quote } from "./src/quote.ts";

export type $ = typeof exec & typeof colors & {
  verbose: boolean;
  cwd: string;
  shell: string;
  cd: typeof cd;
  quote: typeof quote;
};

export const $: $ = exec as $;

Object.setPrototypeOf($, Object.getPrototypeOf(colors));

$._stack = [];
$.shell = "/bin/sh";
$.verbose = false;
$.cwd = Deno.cwd();
$.cd = cd;
$.quote = quote;

export { cd };
