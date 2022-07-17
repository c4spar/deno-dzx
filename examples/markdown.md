# Documentation + Code Block Execution = ❤️🦕

`dzx` permits the execution of "fenced" code blocks in Markdown files. Simply
mark your triple-back-tick code fence with one of the following supported
languages codes:

- `js`
- `javascript`
- `ts`
- `typescript`

and your code blocks will all be collected into a single file and executed just
like any other script by `dzx`.

## The First Block to Execute

```ts
$.verbose = true;

const name = "World";
await $`echo "Hello ${name}!"`;
```

## Some Details

- Only triple-back-tick "fenced" code blocks are executed, i.e. `inline code` is
  ignored.
- Only code blocks marked with a supported language code will be executed, i.e.
  the following code block:

  ```ruby
  name = 'world'
  puts "Hello #{name}!"
  ```

  will be ignored since `ruby` is not supported. This restriction also applies
  to code blocks _with no language code at all_.

- _Every_ supported code block will be executed, as one single script, in the
  order they are written. The code blocks will simply be extracted from the
  markdown, then concatenated together and saved to a temporary file for
  execution. This means that a given code block **is not** isolated from the
  others when executed!

## A Second Block to Execute

```ts
// Note that we're using the `name`
// defined in the first code block
await $`echo "Hello again ${name}!"`;
```

## Technical Gotchas

- The code blocks will be extracted, concatenated together, and saved to a
  temporary file created by `Deno.makeTempFile`. It is _this temp file_ that is
  actually executed by `Deno`, which means that the value of `import.meta.url`
  _would_ point to a file in your system `tmp` directory at runtime.

  To permit usage of `import.meta.url` within your code blocks, `dzx` replaces
  all occurrences of `import.meta.url` within every code block with the literal
  string value of the original markdown file as a file url (essentially what you
  would get if `Deno` could natively run the markdown file and you used the
  import meta). This replacement happens naively, without any attempt to
  determine if the import meta was being used in a template string, was being
  concatenated to to another string, or anything else - just a straight up
  `String.prototype.replaceAll`.

  ```js
  // TLDR: keep your usage of `import.meta.url` simple and naive-string-replacement friendly ❤️
  const importMetaUrl = import.meta.url;
  // this line will be replace at compile-time with (for example):
  // const importMetaUrl = "file:///home/user/code/example.md";
  console.log({ importMetaUrl });
  ```

- If you installed `dzx` without the `--no-check` flag, then your code blocks
  will be type checked. If you don't want that, you can either re-install `dzx`
  with the `--no-check` flag included, or add `// @ts-nocheck <reason>` as a
  fenced code block of its own at the top of your markdown file (or just before
  the first line of code in whatever your first fenced code block is).

- You do not need to add a `shebang` (e.g. `#!/usr/bin/env dzx`) to your code
  blocks, nor do you need to add a reference to the `dzx` types. Both of these
  will be automatically inserted at the top of the compiled (temp file)
  typescript module.

## Wrapping up

If you run _this Markdown file_ with `dzx`, the compiled script file will be
something like this:

```
#!/usr/bin/env dzx
/// <reference path="https://deno.land/x/dzx@0.4.0/globals.ts" />
// deno-lint-ignore-file

$.verbose = true;

const name = 'World';
await $`echo "Hello ${name}!"`;
// Note that we're using the `name`
// defined in the first code block
await $`echo "Hello again ${name}!"`;
// TLDR: keep your usage of `"file:///<redacted>/dzx/examples/markdown.md"` simple and naive-string-replacement friendly ❤️
const importMetaUrl = "file:///<redacted>/dzx/examples/markdown.md";
// this line will be replace at compile-time with (for example):
// const importMetaUrl = "file:///home/user/code/example.md";
console.log({ importMetaUrl });
```
