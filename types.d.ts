import type {
  $,
  async as _async,
  cd as _cd,
  flags as _flags,
  fs as _fs,
  io as _io,
  log as _log,
  path as _path,
  quote as _quote,
} from "./mod.ts";

import type {
  ArgParsingOptions as _ArgParsingOptions,
  Args as _Args,
  Deferred as _Deferred,
  FormatInputPathObject as _FormatInputPathObject,
  GlobOptions as _GlobOptions,
  GlobToRegExpOptions as _GlobToRegExpOptions,
  ParsedPath as _ParsedPath,
} from "./src/runtime/deps.ts";

declare global {
  // dzx
  const $: $;
  const cd: typeof _cd;
  const quote: typeof _quote;

  // x
  const async: typeof _async;
  const path: typeof _path;
  const io: typeof _io;
  const fs: typeof _fs;
  const log: typeof _log;
  const flags: typeof _flags;

  namespace flags {
    type Args = _Args;
    type ArgParsingOptions = _ArgParsingOptions;
  }

  namespace async {
    type Deferred<T> = _Deferred<T>;
  }

  namespace path {
    type FormatInputPathObject = _FormatInputPathObject;
    type GlobOptions = _GlobOptions;
    type GlobToRegExpOptions = _GlobToRegExpOptions;
    type ParsedPath = _ParsedPath;
  }

  interface Window {
    // dzx
    $: $;
    cd: typeof _cd;
    quote: typeof _quote;

    // x
    async: typeof _async;
    path: typeof _path;
    io: typeof _io;
    fs: typeof _fs;
    log: typeof _log;
    flags: typeof _flags;
  }

  interface WorkerGlobalScope {
    // dzx
    $: $;
    cd: typeof _cd;
    quote: typeof _quote;

    // x
    async: typeof _async;
    path: typeof _path;
    io: typeof _io;
    fs: typeof _fs;
    log: typeof _log;
    flags: typeof _flags;
  }
}
