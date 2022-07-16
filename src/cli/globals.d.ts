import type {
  $ as _$,
  $e as _$e,
  $o as _$o,
  cd as _cd,
  quote as _quote,
} from "../runtime/mod.ts";

import type {
  Args as _Args,
  async as _async,
  CopyOptions as _CopyOptions,
  DebouncedFunction as _DebouncedFunction,
  Deferred as _Deferred,
  DelayOptions as _DelayOptions,
  ExpandGlobOptions as _ExpandGlobOptions,
  flags as _flags,
  FormatInputPathObject as _FormatInputPathObject,
  FormatterFunction as _FormatterFunction,
  fs as _fs,
  GlobOptions as _GlobOptions,
  GlobToRegExpOptions as _GlobToRegExpOptions,
  HandlerOptions as _HandlerOptions,
  io as _io,
  IOReadableStreamFromReaderOptions as _IOReadableStreamFromReaderOptions,
  IOWritableStreamFromWriterOptions as _IOWritableStreamFromWriterOptions,
  LevelName as _LevelName,
  log as _log,
  LogConfig as _LogConfig,
  LogMode as _LogMode,
  ParsedPath as _ParsedPath,
  ParseOptions as _ParseOptions,
  path as _path,
  ReadableStreamFromReaderOptions as _ReadableStreamFromReaderOptions,
  ReadLineResult as _ReadLineResult,
  streams as _streams,
  WalkEntry as _WalkEntry,
  WalkOptions as _WalkOptions,
  WritableStreamFromWriterOptions as _WritableStreamFromWriterOptions,
} from "../std/mod.ts";

declare global {
  /**
   * Run a command and return its output streams as well
   * as details about the process exit status.
   */
  const $: _$;

  /**
   * Run a command and return only its trimmed stdout.
   *
   * If the command throws an error or fails in some way,
   * this method will not re-throw that error. It will only
   * have output if the command produces text written
   * to its stdout stream.
   *
   * If you want assurance that a failure in the child process
   * will throw an error, use `$`.
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
  const streams: typeof _streams;
  const fs: typeof _fs;
  const log: typeof _log;
  const flags: typeof _flags;

  namespace async {
    type DebouncedFunction<T extends Array<unknown>> = _DebouncedFunction<T>;
    type Deferred<T> = _Deferred<T>;
    type DelayOptions = _DelayOptions;
  }

  namespace path {
    type FormatInputPathObject = _FormatInputPathObject;
    type GlobOptions = _GlobOptions;
    type GlobToRegExpOptions = _GlobToRegExpOptions;
    type ParsedPath = _ParsedPath;
  }

  namespace io {
    /** @deprecated This interface has been moved to `streams`. */
    type ReadableStreamFromReaderOptions = _IOReadableStreamFromReaderOptions;
    /** @deprecated This interface has been moved to `streams`. */
    type WritableStreamFromWriterOptions = _IOWritableStreamFromWriterOptions;
    type ReadLineResult = _ReadLineResult;
  }

  namespace streams {
    type ReadableStreamFromReaderOptions = _ReadableStreamFromReaderOptions;
    type WritableStreamFromWriterOptions = _WritableStreamFromWriterOptions;
  }

  namespace fs {
    type CopyOptions = _CopyOptions;
    type ExpandGlobOptions = _ExpandGlobOptions;
    type WalkEntry = _WalkEntry;
    type WalkOptions = _WalkOptions;
  }

  namespace log {
    type FormatterFunction = _FormatterFunction;
    type HandlerOptions = _HandlerOptions;
    type LevelName = _LevelName;
    type LogConfig = _LogConfig;
    type LogMode = _LogMode;
  }

  namespace flags {
    /** @deprecated use `ParseOptions` instead. */
    type ArgParsingOptions = _ParseOptions;
    type ParseOptions = _ParseOptions;
    type Args = _Args;
  }

  interface Window {
    // dzx
    $: _$;
    $o: typeof _$o;
    $e: typeof _$e;
    cd: typeof _cd;
    quote: typeof _quote;

    // x
    async: typeof _async;
    path: typeof _path;
    io: typeof _io;
    streams: typeof _streams;
    fs: typeof _fs;
    log: typeof _log;
    flags: typeof _flags;
  }

  interface WorkerGlobalScope {
    // dzx
    $: _$;
    $o: typeof _$o;
    $e: typeof _$e;
    cd: typeof _cd;
    quote: typeof _quote;

    // x
    async: typeof _async;
    path: typeof _path;
    io: typeof _io;
    streams: typeof _streams;
    fs: typeof _fs;
    log: typeof _log;
    flags: typeof _flags;
  }
}
