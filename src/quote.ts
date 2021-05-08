import { escapeStr } from "../deps.ts";

export function quote(
  pieces: TemplateStringsArray,
  ...args: Array<string | number>
) {
  let parsed = pieces[0];
  let i = 0;
  for (; i < args.length; i++) {
    if (typeof args[i] === "string") {
      parsed += escapeStr(args[i] as string) + pieces[i + 1];
    } else {
      parsed += args[i] + pieces[i + 1];
    }
  }
  for (++i; i < pieces.length; i++) {
    parsed += pieces[i];
  }
  return parsed;
}
