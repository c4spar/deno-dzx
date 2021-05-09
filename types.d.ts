import type {
  $,
  cd as _cd,
  parseFlags as _parseFlags,
  quote as _quote,
} from "./mod.ts";
import type {
  ArgParsingOptions as _ArgParsingOptions,
  Args as _Args,
  basename as _basename,
  Buffer as _Buffer,
  dirname as _dirname,
  extname as _extname,
  fromFileUrl as _fromFileUrl,
  isAbsolute as _isAbsolute,
  iter as _iter,
  iterSync as _iterSync,
  join as _join,
  normalize as _normalize,
  readAll as _readAll,
  readAllSync as _readAllSync,
  readLines as _readLines,
  relative as _relative,
  resolve as _resolve,
  toFileUrl as _toFileUrl,
  toNamespacedPath as _toNamespacedPath,
  writeAll as _writeAll,
  writeAllSync as _writeAllSync,
} from "./deps.ts";

declare global {
  // dzx
  const $: $;
  const cd: typeof _cd;
  const quote: typeof _quote;

  // std/io
  const Buffer: typeof _Buffer;
  const iter: typeof _iter;
  const iterSync: typeof _iterSync;
  const readAll: typeof _readAll;
  const readAllSync: typeof _readAllSync;
  const readLines: typeof _readLines;
  const writeAll: typeof _writeAll;
  const writeAllSync: typeof _writeAllSync;

  // std/path
  const basename: typeof _basename;
  const dirname: typeof _dirname;
  const extname: typeof _extname;
  const fromFileUrl: typeof _fromFileUrl;
  const isAbsolute: typeof _isAbsolute;
  const join: typeof _join;
  const normalize: typeof _normalize;
  const relative: typeof _relative;
  const resolve: typeof _resolve;
  const toFileUrl: typeof _toFileUrl;
  const toNamespacedPath: typeof _toNamespacedPath;

  // std/flags
  const parseFlags: typeof _parseFlags;
  type ArgParsingOptions = _ArgParsingOptions;
  type Args = _Args;

  interface Window {
    // dzx
    $: $;
    cd: typeof _cd;
    quote: typeof _quote;

    // std/io
    Buffer: typeof _Buffer;
    iter: typeof _iter;
    iterSync: typeof _iterSync;
    readAll: typeof _readAll;
    readAllSync: typeof _readAllSync;
    readLines: typeof _readLines;
    writeAll: typeof _writeAll;
    writeAllSync: typeof _writeAllSync;

    // std/path
    basename: typeof _basename;
    dirname: typeof _dirname;
    extname: typeof _extname;
    fromFileUrl: typeof _fromFileUrl;
    isAbsolute: typeof _isAbsolute;
    join: typeof _join;
    normalize: typeof _normalize;
    relative: typeof _relative;
    resolve: typeof _resolve;
    toFileUrl: typeof _toFileUrl;
    toNamespacedPath: typeof _toNamespacedPath;

    // std/flags
    parseFlags: typeof _parseFlags;
  }
}
