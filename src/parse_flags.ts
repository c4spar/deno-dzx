import { ArgParsingOptions, Args, parseFlags as _parseFlags } from "../deps.ts";

export function parseFlags(
  args: Array<string>,
  options?: ArgParsingOptions,
): Args {
  if ($.verbose) {
    console.log($.brightMagenta(">_ %s"), args.join(" "));
  }
  return _parseFlags(args, options);
}
