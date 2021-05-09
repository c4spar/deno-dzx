import type {
  $,
  cd as _cd,
  parseFlags as _parseFlags,
  quote as _quote,
} from "./mod.ts";
import type {
  ArgParsingOptions as _ArgParsingOptions,
  Args as _Args,
} from "./deps.ts";

declare global {
  const $: $;
  const cd: typeof _cd;
  const quote: typeof _quote;
  const parseFlags: typeof _parseFlags;

  type ArgParsingOptions = _ArgParsingOptions;
  type Args = _Args;

  interface Window {
    $: $;
    cd: typeof _cd;
    quote: typeof _quote;
    parseFlags: typeof _parseFlags;
  }
}
