import type {
  $,
  async as _async,
  cd as _cd,
  envExists as _envExists,
  envMissing as _envMissing,
  flags as _flags,
  fs as _fs,
  HOME as _HOME,
  io as _io,
  log as _log,
  path as _path,
  quote as _quote,
  USER as _USER,
} from "./mod.ts";

import type {
  ArgParsingOptions as _ArgParsingOptions,
  Args as _Args,
  Deferred as _Deferred,
  FormatInputPathObject as _FormatInputPathObject,
  GlobOptions as _GlobOptions,
  GlobToRegExpOptions as _GlobToRegExpOptions,
  LevelName as _LevelName,
  LogConfig as _LogConfig,
  ParsedPath as _ParsedPath,
  ReadLineResult as _ReadLineResult,
} from "./src/runtime/deps.ts";

declare global {
  // dzx
  const $: $;
  const cd: typeof _cd;
  const quote: typeof _quote;

  /** Equivalent to `$HOME` (the users home directory) in the bash shell */
  const HOME: typeof _HOME;
  /** Equivalent to `$USER` (the current user) in the bash shell */
  const USER: typeof _USER;

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

  namespace io {
    type ReadLineResult = _ReadLineResult;
  }

  namespace log {
    type LevelName = _LevelName;
    type LogConfig = _LogConfig;
  }

  interface Window {
    // dzx
    $: $;
    cd: typeof _cd;
    quote: typeof _quote;

    HOME: typeof _HOME;
    USER: typeof _USER;

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

    HOME: typeof _HOME;
    USER: typeof _USER;

    // x
    async: typeof _async;
    path: typeof _path;
    io: typeof _io;
    fs: typeof _fs;
    log: typeof _log;
    flags: typeof _flags;
  }
}
