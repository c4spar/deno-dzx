import type {
  $,
  cd as _cd,
  parseFlags as _parseFlags,
  quote as _quote,
} from "./mod.ts";
import type {
  ArgParsingOptions as _ArgParsingOptions,
  Args as _Args,
  iter as _iter,
  iterSync as _iterSync,
  readAll as _readAll,
  readAllSync as _readAllSync,
  writeAll as _writeAll,
  writeAllSync as _writeAllSync,
} from "./deps.ts";

declare global {
  const $: $;
  const cd: typeof _cd;
  const quote: typeof _quote;
  const parseFlags: typeof _parseFlags;
  const iter: typeof _iter;
  const iterSync: typeof _iterSync;
  const readAll: typeof _readAll;
  const readAllSync: typeof _readAllSync;
  const writeAll: typeof _writeAll;
  const writeAllSync: typeof _writeAllSync;

  type ArgParsingOptions = _ArgParsingOptions;
  type Args = _Args;

  interface Window {
    $: $;
    cd: typeof _cd;
    quote: typeof _quote;
    parseFlags: typeof _parseFlags;
    iter: typeof _iter;
    iterSync: typeof _iterSync;
    readAll: typeof _readAll;
    readAllSync: typeof _readAllSync;
    writeAll: typeof _writeAll;
    writeAllSync: typeof _writeAllSync;
  }
}
