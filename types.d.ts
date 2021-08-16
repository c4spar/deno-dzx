import type {
  $,
  async as _async,
  cd as _cd,
  envExists as _envExists,
  envMissing as _envMissing,
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
  LevelName as _LevelName,
  LogConfig as _LogConfig,
  ParsedPath as _ParsedPath,
  ReadLineResult as _ReadLineResult,
} from "./src/runtime/deps.ts";

type MaybeString = string | undefined;

declare global {
  // dzx
  const $: $;
  const cd: typeof _cd;
  const quote: typeof _quote;

  /** Equivalent to `$HOME` (the users home directory) in the bash shell */
  const HOME: MaybeString;
  /** Equivalent to `$USER` (the current user) in the bash shell */
  const USER: MaybeString;
  /** The first argument to the script, equivalent to `$1` in the bash shell */
  const $1: MaybeString;
  /** The second argument to the script, equivalent to `$2` in the bash shell */
  const $2: MaybeString;
  /** The third argument to the script, equivalent to `$3` in the bash shell */
  const $3: MaybeString;
  /** The fourth argument to the script, equivalent to `$4` in the bash shell */
  const $4: MaybeString;
  /** The fifth argument to the script, equivalent to `$5` in the bash shell */
  const $5: MaybeString;
  /** The sixth argument to the script, equivalent to `$6` in the bash shell */
  const $6: MaybeString;
  /** The seventh argument to the script, equivalent to `$7` in the bash shell */
  const $7: MaybeString;
  /** The eighth argument to the script, equivalent to `$8` in the bash shell */
  const $8: MaybeString;
  /** The nineth argument to the script, equivalent to `$9` in the bash shell */
  const $9: MaybeString;

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

    HOME: MaybeString;
    USER: MaybeString;
    $1: MaybeString;
    $2: MaybeString;
    $3: MaybeString;
    $4: MaybeString;
    $5: MaybeString;
    $6: MaybeString;
    $7: MaybeString;
    $8: MaybeString;
    $9: MaybeString;

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

    HOME: MaybeString;
    USER: MaybeString;
    $1: MaybeString;
    $2: MaybeString;
    $3: MaybeString;
    $4: MaybeString;
    $5: MaybeString;
    $6: MaybeString;
    $7: MaybeString;
    $8: MaybeString;
    $9: MaybeString;

    // x
    async: typeof _async;
    path: typeof _path;
    io: typeof _io;
    fs: typeof _fs;
    log: typeof _log;
    flags: typeof _flags;
  }
}
