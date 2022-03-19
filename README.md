<h1 align="center">dzx</h1>

<p align="center" class="badges-container">
  <a href="https://github.com/c4spar/deno-dzx/releases">
    <img alt="Version" src="https://img.shields.io/github/v/release/c4spar/deno-dzx?logo=github&color=F86F00" />
  </a>
  <a href="https://codecov.io/gh/c4spar/deno-dzx">
    <img src="https://codecov.io/gh/c4spar/deno-dzx/branch/main/graph/badge.svg"/>
  </a>
  <a href="https://github.com/c4spar/deno-dzx/issues">
    <img alt="issues" src="https://img.shields.io/github/issues/c4spar/deno-dzx?label=issues&logo=github">
  </a>
  <a href="https://deno.land/">
    <img alt="Deno version" src="https://img.shields.io/badge/deno-^1.13.0-blue?logo=deno&color=blue" />
  </a>
  <a href="https://github.com/c4spar/deno-dzx/blob/main/LICENSE">
    <img alt="Licence" src="https://img.shields.io/github/license/c4spar/deno-dzx?logo=github" />
  </a>
  <a href="https://deno.land/x/dzx">
    <img alt="deno.land" src="https://img.shields.io/badge/deno.land/x/dzx-blue?logo=deno&logoColor=959DA6&color=272727" />
  </a>
</p>

<p align="center">
  <b>Deno shell tools inspired by <a href="https://github.com/google/zx">zx</a></b>
</p>

```typescript
#!/usr/bin/env dzx
/// <reference path="https://deno.land/x/dzx@0.3.0/types.d.ts" />

$.verbose = true;
$.shell = "/usr/local/bin/zsh";

console.log(`Hello from ${$.blue.bold("dzx")}!`);

const branch = await $`git branch --show-current`;
await $`dep deploy --branch=${branch}`;

// Print command output to stdout. Will be reverted to "piped" after all async ops are done.
$.stdout = "inherit";
$.stderr = "inherit";
await Promise.all([
  $`deno lint`,
  $`deno fmt --check`,
  $`deno test --allow-all`,
]);

const name = "foo bar";
await $`mkdir ./tmp/${name}`; // Params will be quoted if required: /tmp/'foo bar'.

cd("tmp/foo bar");
console.log(Deno.cwd()); // ./tmp/foo bar

cd("tmp");
console.log(Deno.cwd()); // ./tmp

await async.delay(1000);
const basename = path.basename(import.meta.url);
const stdin = await io.readAll(Deno.stdin);
await fs.ensureDir("./tmp");
```

## Content

- [Install](#install)
- [Usage](#usage)
  - [Permissions](#permissions)
  - [Worker](#worker)
  - [Markdown](#markdown)
  - [Methods](#methods)
  - [Modules](#modules)
  - [Variables](#variables)
- [CLI](#cli)
- [Contributing](#contributing)
- [License](#license)

## Install

```
deno install --allow-all --unstable -f https://deno.land/x/dzx@0.3.0/dzx.ts
```

> `--unstable` is required for the `bundle` command which uses `Deno.emit`, for
> `std/fs/copy` and for web workers.

## Usage

To start writing a dzx script, add next shebang at the beginning of your script:

```
#!/usr/bin/env dzx
```

To enable typings for typescript in your IDE, you can add a tripple slash
reference to the top of the file,

```
#!/usr/bin/env dzx
/// <reference path="https://deno.land/x/dzx@0.3.0/types.d.ts" />
```

or you can import all symbol directly from the `dzx/mod.ts` module instead of
using globals.

```ts
#!/usr/bin/env dzx
import { $, cd, fs, io, log, path } from "https://deno.land/x/dzx@0.3.0/mod.ts";
```

After making your script executable,

```shell
chmod +x ./script.ts
```

you can simply run it with:

```shell
./script.ts
```

## Permissions

You can use `dzx` without installation by using next shebang. This also allows
you to explicitly set the permissions for your script.

```typescript
#!/usr/bin/env deno run --allow-run --allow-read --allow-env https://deno.land/x/dzx@0.3.0/dzx.ts
/// <reference path="https://deno.land/x/dzx@0.3.0/types.d.ts" />

console.log(`Hello ${$.blue.bold("world")}!`);
```

## Worker

> This is currently an exerminental feature. Permission flags doens't support
> values currently. Read permissions are required by default.

If `dzx` is called with `-w` or `--worker`, the script is executed inside an
isolated web worker. If enabled, you can pass explicit permissions directly to
the `dzx` cli.

```typescript
#!/usr/bin/env dzx --worker --allow-read
/// <reference path="https://deno.land/x/dzx@0.3.0/types.d.ts" />

console.log(`Hello from ${$.blue.bold("worker")}!`);
```

## Markdown

With `dzx` you can run the `js`/`ts` code blocks from a Markdown file as if they
were a regular script. This is very convenient when you want to blend some
nicely formatted documentation in with the actual steps of execution.

Give it a try by running:

```bash
dzx ./examples/markdown.md
```

See the [markdown example](./examples/markdown.md) for further documentation and
notes.

## Methods

- `` $`command` ``: Executes a shell command.

  ```ts
  const count = parseInt(await $`ls -1 | wc -l`);
  console.log(`Files count: ${count}`);
  ```

  If the executed program was successful, an instance of `ProcessOutput` will be
  return.

  ```ts
  class ProcessOutput {
    readonly stdout: string;
    readonly stderr: string;
    readonly combined: string;
    readonly status: Deno.ProcessStatus;
    toString(): string;
  }
  ```

  If the executed program returns a non-zero exit code, a `ProcessError` will be
  thrown.

  The `ProcessError` class extends from the `Error` class and implements all
  properties and methods from `ProcessOutput`.

  ```ts
  try {
    await $`exit 1`;
  } catch (error) {
    console.log(`Exit code: ${error.status.code}`);
    console.log(`Error: ${error.stderr}`);
  }
  ```

- `` $s`command` ``: Executes a shell command and _only returns its exit code_
  (without throwing an error)

  ```ts
  const trueStatus = await $s`true`);
  console.log(trueStatus); // -> 0
  ```

  If the executed program returns a non-zero exit code, no error will be thrown.
  Either the non-zero code will be the return value, or a `1` will be returned
  by default.

  ```ts
  const falseStatus = await $s`false`);
  console.log(falseStatus); // -> 1
  ```

- `` $o`command` ``: Executes a shell command and _only returns its trimmed
  stdout_ (without throwing an error)

  ```ts
  const stdout = await $o`pwd`);
  console.log(stdout); // -> '/home/code/project
  ```

  If the executed program returns a non-zero exit code, no error will be thrown.
  Either the failed processes stdout will be the return value, or an empty
  string will be returned by default

  ```ts
  const stdout = await $o`echo 'hello' >&2; exit 1;`);
  console.log(stdout); // -> ""
  ```

- `` $e`command` ``: Executes a shell command and _only returns its trimmed
  stderr_ (without throwing an error)

  ```ts
  const stderr = await $e`pwd`);
  console.log(stderr); // -> ""
  ```

  If the executed program returns a non-zero exit code, no error will be thrown.
  Either the failed processes stderr will be the return value, or an empty
  string will be returned by default

  ```ts
  const stderr = await $e`echo 'hello' >&2; exit 1;`);
  console.log(stderr); // -> "hello"
  ```

- `cd()`: Change the current working directory. If path does not exist, an error
  is thrown. The path is always relative to the original `cwd`, unless the path
  is an absolute path or starts with `~` which indecates the home directory.

  ```ts
  console.log(Deno.cwd()); // --> /example/directory
  cd("foo/bar");
  console.log(Deno.cwd()); // --> /example/directory/foo/bar
  cd("foo/baz");
  console.log(Deno.cwd()); // --> /example/directory/foo/baz
  cd("/tmp");
  console.log(Deno.cwd()); // --> /tmp
  cd("~/Documents");
  console.log(Deno.cwd()); // --> [HOME]/Documents
  ```

- `` quote`string` ``: The quote methods quotes safly a string. by default the
  `shq` package is used. Can be overidden with `$.quote`.

## Modules

- **$.\[style]:** Cliffy's color module. A chainable wrapper for Deno's
  `std/fmt/colors` module. Available on the global `$` symbol.

  ```ts
  console.log($.blue.bold("Hello world!"));
  ```

- **async:** Deno's `std/async` module.

  ```ts
  await async.delay(1000);
  ```

- **path:** Deno's `std/path` module.

  ```ts
  const basename = path.basename(import.meta.url);
  const options: path.GlobToRegExpOptions = { os: "linux" };
  const regex: RegExp = path.globToRegExp("*.ts", options);
  ```

- **io:** Deno's `std/io` module.

  ```ts
  const fileReader = await Deno.open("./example.txt");
  for await (let line of io.readLines(fileReader)) {
    console.log(line);
  }
  ```

- **streams:** Deno's `std/streams` module.

  ```ts
  const data = await streams.readAll(Deno.stdin);
  ```

- **fs:** Deno's `std/fs` module.

  ```ts
  fs.ensureDir("./tmp");
  ```

- **log:** Deno's `std/log` module.

  ```ts
  log.info("Some info!");
  ```

- **flags:** Deno's `std/flags` module.

  ```ts
  const args: flags.Args = flags.parse($.args);
  ```

## Variables

- **$.shell:** Set the shell that is used by `` $`command` ``. Default:
  `/bin/bash`
- **$.prefix:** Command prefix. Default: `set -euo pipefail;`.
- **$.mainModule:** The executed dzx script.
- **$.verbose:** Enable debugging output (log shell commands and execution
  time).
- **$.stdout:** Change stdout mode of `` $`command` ``. Can be `"inherit"`,
  `"piped"`, `"null"` or `number`. Will be reverted to default after all async
  ops are done. Default: `"piped"`
- **$.stderr:** Change stderr mode of `` $`command` ``. Can be `"inherit"`,
  `"piped"`, `"null"` or `number`. Will be reverted to default after all async
  ops are done. Default: `"piped"`
- **$.throwErrors:** Throw errors instead of calling `Deno.exit`.
- **$.args:** Equivalent to `Deno.args`, but without the script name as first
  argument.
- **$.startTime:** The execution start time in ms.
- **$.time:** The time left since execution start (now() - $.startTime).
- **$.quote:** Parser method that is used to safely quote strings. Used by:
  `` $`command` ``

# CLI

```
Usage:   dzx [script] [args...]
Version: 0.3.0

Description:

  🦕 A custom deno runtime for fun.

Options:

  -h, --help       - Show this help.
  -V, --version    - Show the version number for this program.
  -A, --allow-all  - Allow all permissions.                                           (Depends: --worker)
  --allow-env      - Allow environment access.                                        (Depends: --worker)
  --allow-hrtime   - Allow high resolution time measurement.                          (Depends: --worker)
  --allow-net      - Allow network access.                                            (Depends: --worker)
  --allow-ffi      - Allow loading dynamic libraries.                                 (Depends: --worker)
  --allow-read     - Allow file system read access.                                   (Depends: --worker)
  --allow-run      - Allow running subprocesses.                                      (Depends: --worker)
  --allow-write    - Allow file system write access.                                  (Depends: --worker)
  -w, --worker     - Run script in an isolated web worker with it's own permissions.

Commands:

  bundle   [script]                                           - Bundle an dzx script to a standalone deno sript.
  compile  [compile-options...] [script] [script-options...]  - Combile an dzx script to a standalone binary.
  eval     <code>                                             - Evaluate a dzx script from the command line.
  repl                                                        - Start a dzx repl.
  upgrade                                                     - Upgrade dzx executable to latest or given version.
```

- **dzx** `[script] [...args]`: Run a local or remote dzx script (optional in a
  web worker).

  ```shell
  dzx --worker ./example.ts
  ```

- **dzx bundle** `[script]`: Bundle a dzx script to a standalone deno script.
  Can also read from stdin.

  ```shell
  dzx bundle ./example.ts > bundle.js
  deno run --allow-read --allow-env --allow-run bundle.js
  ```

- **dzx compile** `[...permissions] [script] [...script-arguments]`: Compile an
  dzx script to a standalone binary. Can also read from stdin.

  ```shell
  dzx compile --allow-read --allow-env --allow-run ./example.ts --port 8080
  ```

  > Note that when reading from `stdin`, you must separate "deno compile" flags
  > (i.e. your permissions) from your "script args" with a double dash (`--`),
  > i.e.
  > ```shell
  > cat ./example.ts | dzx compile --allow-read -- --port 8080
  > ```
  > It is also recommended when reading from `stdin` that you pass the --output
  > flag with your permissions to specify the output file name, otherwise the
  > compiled file will be emitted with a random value as its name.

- **dzx repl**: Start a dzx repl (deno repl bootstrapped with dzx).

- **dzx upgrade**: Start a dzx repl.

## Contributing

Any kind of contribution is welcome!

## License

[MIT](LICENSE)
