import type {
  $,
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
  const path: typeof _path;
  const io: typeof _io;
  const fs: typeof _fs;
  const log: typeof _log;
  const flags: typeof _flags;

  interface Window {
    // dzx
    $: $;
    cd: typeof _cd;
    quote: typeof _quote;

    // x
    path: typeof _path;
    io: typeof _io;
    fs: typeof _fs;
    log: typeof _log;
    flags: typeof _flags;
  }
}
