<h1 align="center">dzx</h1>

<p align="center" class="badges-container">
  <a href="https://github.com/c4spar/deno-dzx/releases">
    <img alt="Latest" src="https://img.shields.io/github/v/tag/c4spar/deno-dzx?style=flat&label=latest" />
  </a>
  <a href="https://github.com/c4spar/deno-dzx/actions/workflows/test.yaml">
    <img alt="Build" src="https://img.shields.io/github/workflow/status/c4spar/deno-dzx/Test?style=flat"/>
  </a>
  <a href="https://codecov.io/gh/c4spar/deno-dzx">
    <img alt="Coverage" src="https://img.shields.io/codecov/c/github/c4spar/deno-dzx?style=flat">
  </a>
  <a href="https://github.com/c4spar/deno-dzx/issues">
    <img alt="Issues" src="https://img.shields.io/github/issues/c4spar/deno-dzx?style=flat" />
  </a>
  <a href="https://github.com/c4spar/deno-dzx/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/c4spar/deno-dzx?style=flat" />
  </a>
  <a href="https://deno.land/x/dzx">
    <img alt="deno.land/x" src="https://img.shields.io/badge/deno.land/x/dzx-blue?logo=deno&logoColor=959DA6&color=272727" />
  </a>
</p>

<p align="center">
  <b>Deno shell tools inspired by <a href="https://github.com/google/zx">zx</a></b>
</p>

## Example

> **Warning** This project is in a very experimental state. Many things are
> subject to change.

```typescript
import {
  $,
  async,
  cd,
  fs,
  io,
  path,
} from "https://deno.land/x/dzx@0.3.2/mod.ts";

// Output stdout & stderr. Can be: true, false, 0, 1 or 2. Default is: 1
$.verbose = 2;
$.shell = "/usr/local/bin/zsh";

console.log(`Hello from ${$.blue.bold("dzx")}!`);

const branch = await $`git branch --show-current`;
await $`dep deploy --branch=${branch}`;

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

- [Usage](#usage)
  - [Shell](#shell)
    - [Variables](#variables)
    - [Methods](#methods)
    - [Process](#process)
  - [Std modules](#std-modules)
  - [Globals](#globals)
- [CLI](#cli)
  - [Install](#install)
  - [Execute scripts via cli](#execute-scripts-via-cli)
  - [Permissions](#permissions)
  - [Markdown](#markdown)
  - [Experimental](#experimental)
    - [Worker](#worker)
- [Contributing](#contributing)
- [License](#license)

## Usage

`dzx` has multiple entry points.

- `./mod.ts`: Exports the shell and all std modules.
- `./shell.ts`: Exports only the shell.
- `./globals.ts`: Registers global types and assigns all members exported by
  `./mod.ts` to `self` if imported as module. Globals are mostly used in
  combination with the cli.

### Shell

```ts
import { $ } from "https://deno.land/x/dzx@0.3.2/mod.ts";
```

#### Variables

- **$.shell:** Set the shell that is used by `` $`command` ``. Default:
  `/bin/bash`
- **$.prefix:** Command prefix. Default: `set -euo pipefail;`.
- **$.mainModule:** The executed dzx script.
- **$.verbose:** Enable debugging output (log shell commands and execution
  time).
- **$.stdout:** Change stdout mode of `` $`command` ``. Can be `"inherit"`,
  `"piped"`, `"null"` or `number`. Default: `"piped"`
- **$.stderr:** Change stderr mode of `` $`command` ``. Can be `"inherit"`,
  `"piped"`, `"null"` or `number`. Default: `"piped"`
- **$.args:** Equivalent to `Deno.args`, but without the script name as first
  argument.
- **$.startTime:** The execution start time in ms.
- **$.time:** The time left since execution start (now() - $.startTime).
- **$.quote:** Parser method that is used to safely quote strings. Used by:
  `` $`command` ``

#### Methods

- `` $`command` ``: Executes a shell command and returns a `Process` instance.
  The [`Process`](#process) class has several chainable methods.

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

#### Process

Methods and properties of the `Process` class which implements
`Promise<ProcessOutput>` and is returned by the `$` method.

- `.pid`: Returns the process id of the executed command.

  ```ts
  // Get the process id.
  const child = $`echo foo`;
  console.log("pid:", child.pid);
  await child;
  ```

- `.noThrow`: If invoked the command doesn't throw an error if the command
  returns a none-zero exit code.

  ```ts
  // Don't throw an error for none-zero exit codes.
  const { status } = await $`exit 1`.noThrow;
  ```

- `.statusCode`: Returns the status code of the executed command and calls
  `.noThrow` internally to catch the error and return the status code.

  ```ts
  // Get only the status code.
  const statusCode: number = await $`exit 1`.statusCode;
  ```

- `.stdout` Returns `Promise<string>` and resolves with the stdout output.

  ```ts
  // Get only stdout.
  const foo: string = await $`echo foo; echo bar >&2`.stdout;
  ```

- `.stderr` Returns `Promise<string>` and resolves with the stderr output.

  ```ts
  // Get only stderr.
  const bar: string = await $`echo foo; echo bar >&2`.stderr;
  ```

- `.retry(retries: number | RetryCallback)` Retry the command `n` times if it
  fails.

  ```ts
  // Retry the command 3 times.
  await $`exit 1`.retry(3);

  // Retry the command 3 times using a callback handler.
  await $`exit 1`.retry(({ retries }: ProcessError) => retries < 3);
  ```

- `.delay(delay: number)` Number of milliseconds to delay the retry of a failed
  command. Default: `500`

  ```ts
  // Retry the command 3 times but wait 1sec before executing it again.
  await $`exit 1`.retry(3).delay(1000);
  ```

- `.timeout(timeout: number)` Throws an error if the command takes longer than
  the provided `timeout` in milliseconds.

  ```ts
  // Kill the command if it takes longer than one second.
  await $`sleep 10`.timeout(1000);
  ```

- `.kill(signal: Deno.Signal)` Kills the running process.

  ```ts
  // Manually kill the command.
  const child = $`sleep 10`;
  setTimout(() => child.kill("SIGINT"), 100);
  await child;
  ```

### Std modules

> **Note** The `./mod.ts` module exports several `deno/std` modules. If you
> don't need these modules you can just import the `$` symbol from the
> `./shell.ts` module.

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

### Globals

> **Note** Globals are mostly used by the cli. In most cases you don't need
> globals and you can just import all members from `./mod.ts` or `./shell.ts`.

When impoting `./globals.ts`, all members exported by `./mod.ts` are globally
available.

```ts
import "https://deno.land/x/dzx@0.3.2/globals.ts";

cd("foo/bar");

await $`ls | wc -l`;
```

## CLI

### Install

```
deno install --allow-all --unstable -f https://deno.land/x/dzx@0.3.2/dzx.ts
```

> **Warning** `--unstable` is required for the `bundle` command which uses
> `Deno.emit`, for `std/fs/copy` and for web workers.

### Commands

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

- **dzx eval**: Evaluate a dzx script from command line.

  ```shell
  dzx eval "console.log($.shell)"
  ```

  Eval can also read from stdin:

  ```shell
  echo "console.log($.shell)" | dzx eval
  ```

- **dzx repl**: Start a dzx repl (Read eval print loop).

  The `repl` command starts a deno repl bootstrapped with the dzx runtime code.

- **dzx upgrade**: Upgrade the `dzx` executable to latest or given version.

  Upgrade to latest version:

  ```shell
  dzx upgrade
  ```

  Upgrade to specific version:

  ```shell
  dzx upgrade --version 3.0.0
  ```

  List all available versions:

  ```shell
  dzx upgrade --list-versions
  ```

### Execute scripts via cli

When a dzx script is executed via CLI, you don't need to import anything. All
exports are automatically global available. This applies also to commands like
`dzx eval "console.log($)"`.

To start writing a dzx script, add next shebang at the beginning of your script:

```
#!/usr/bin/env dzx
```

After making your script executable,

```shell
chmod +x ./script.js
```

you can simply run it with:

```shell
./script.js
```

To enable typescript support in your IDE, you can optionally add a tripple slash
reference to the top of the file.

```
#!/usr/bin/env dzx
/// <reference path="https://deno.land/x/dzx@0.3.2/types.d.ts" />
```

### Permissions

You can use `dzx` without installation by using next shebang. This also allows
you to explicitly set the permissions for your script.

```typescript
#!/usr/bin/env deno run --allow-run --allow-read --allow-env https://deno.land/x/dzx@0.3.2/dzx.ts
/// <reference path="https://deno.land/x/dzx@0.3.2/types.d.ts" />

console.log(`Hello ${$.blue.bold("world")}!`);
```

### Markdown

With `dzx` you can run the `js`/`ts` code blocks from a Markdown file as if they
were a regular script. This is very convenient when you want to blend some
nicely formatted documentation in with the actual steps of execution.

Give it a try by running:

```bash
dzx ./examples/markdown.md
```

> **Note** See the [markdown example](./examples/markdown.md) for further
> documentation and notes.

### Experimental

#### worker

> **Warning** This is an exerminental feature. Permission flags doesn't support
> values currently. Read permissions are required by default.

If `dzx` is called with `-w` or `--worker`, the script is executed inside an
isolated web worker. If enabled, you can pass explicit permissions directly to
the `dzx` cli.

```typescript
#!/usr/bin/env dzx --worker --allow-read
/// <reference path="https://deno.land/x/dzx@0.3.2/types.d.ts" />

console.log(`Hello from ${$.blue.bold("worker")}!`);
```

## Contributing

Any kind of contribution is very welcome!

## License

[MIT](LICENSE)
