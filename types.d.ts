import type {
  $,
  ArgParsingOptions as _ArgParsingOptions,
  Args as _Args,
  async as _async,
  cd as _cd,
  flags as _flags,
  fs as _fs,
  io as _io,
  log as _log,
  path as _path,
  quote as _quote,
} from "./mod.ts";

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
