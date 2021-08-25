import type {
  $,
  $e as _$e,
  $o as _$o,
  $s as _$s,
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
  LevelName as _LevelName,
  LogConfig as _LogConfig,
  ParsedPath as _ParsedPath,
  ReadLineResult as _ReadLineResult,
} from "./src/runtime/deps.ts";

declare global {
  /**
   * Run a command and return its output streams as well
   * as details about the process exit status.
   */
  const $: $;

  /**
   * Run a command and return only its exit code
   *
   * If the command throws an error or fails in some way,
   * this method will not re-throw that error. It will
   * either return the exit code from the process, or `1`
   * if no exit code is produced (due to an error)
   *
   * If you want assurance that a failure in the child process
   * will throw an error, use `$`
   * @see $
   */
  const $s: typeof _$s;

  /**
   * Run a command and return only its trimmed stdout
   *
   * If the command throws an error or fails in some way,
   * this method will not re-throw that error. It will only
   * have output if the command produces text written
   * to its stdout stream.
   *
   * If you want assurance that a failure in the child process
   * will throw an error, use `$`
   * @see $
   */
  const $o: typeof _$o;

  /**
   * Run a command and return only its trimmed stderr
   *
   * If the command throws an error or fails in some way,
   * this method will not re-throw that error. It will only
   * have output if the command produces text written
   * to its stderr stream.
   *
   * If you want assurance that a failure in the child process
   * will throw an error, use `$`
   * @see exec
   */
  const $e: typeof _$e;
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
    $s: typeof $s;
    $o: typeof $o;
    $e: typeof $e;
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
    $s: typeof $s;
    $o: typeof $o;
    $e: typeof $e;
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
