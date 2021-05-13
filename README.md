<h1 align="center">dzx</h1>

<p align="center" class="badges-container">
  <a href="https://github.com/c4spar/deno-dzx/releases">
    <img alt="Version" src="https://img.shields.io/github/v/release/c4spar/deno-dzx?logo=github&color=F86F00" />
  </a>
  <a href="https://github.com/c4spar/deno-dzx/issues">
    <img alt="issues" src="https://img.shields.io/github/issues/c4spar/deno-dzx?label=issues&logo=github">
  </a>
  <a href="https://deno.land/">
    <img alt="Deno version" src="https://img.shields.io/badge/deno-^1.7.0-blue?logo=deno&color=blue" />
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
/// <reference path="https://deno.land/x/dzx/types.d.ts" />

console.log(`Hello from ${$.blue.bold("dzx")}!`);

const branch = await $`git branch --show-current`;
await $`dep deploy --branch=${branch}`;

await Promise.all([
  $`deno lint --unstable`,
  $`deno fmt --check`,
  $`deno test --allow-all`,
]);

const name = "foo bar";
await $`mkdir /tmp/${name}`; // <-- string will be safly quoted to: /tmp/'foo bar'
```

## Content

- [Install](#install)
- [Usage](#usage)
  - [Javascript](#javascript)
  - [Typescript](#typescript)
  - [Remote usage](#remote-usage)
  - [Worker and permissions](#worker-and-permissions)
- [CLI](#cli)
- [API](#api)
  - [Methods](#methods)
  - [Modules](#modules)
  - [Options](#options)
- [Contributing](#contributing)
- [License](#license)

## Install

```
deno install --allow-all -r -f https://deno.land/x/dzx/dzx.ts
```

## Usage

To start writing a dzx script, add next shebang at the beginning of your script:

```
#!/usr/bin/env dzx
```

### Javascript

Now you will be able to run your script as:

```shell
chmod +x ./script.js
./script.js
```

### Typescript

If you want to use typescript you need to add a tripple slash reference to get
global typings working.

```
#!/usr/bin/env dzx
/// <reference path="https://deno.land/x/dzx/types.d.ts" />
```

Or you can import all symbol directly from `dzx/mod.ts` instead of using
globals.

```ts
#!/usr/bin/env dzx
import { $, cd, fs, io, log, path } from "https://deno.land/x/dzx/mod.ts";
```

Now you will be able to run your typescript script the same way as your js
script:

```shell
chmod +x ./script.ts
./script.ts
```

### Remote usage

You can also use `dzx` directly without installation by using the following
shebang. This also allows you to explicitly set the permissions for your script.

```typescript
#!/usr/bin/env deno run --allow-run --allow-read --allow-env https://deno.land/x/dzx/dzx.ts
/// <reference path="https://deno.land/x/dzx/types.d.ts" />

console.log(`Hello ${$.blue.bold("world")}!`);
```

### Worker and permissions

If `dzx` is called with `-w` or `--worker`, the script is executed inside an
isolated web worker. If enabled, you can also set explicit permissions for your
script.

> This is currently an exerminental feature and the permission flags doens't
> support values currently. Read permissions are required by default! Worker are
> currently not supported with `bundle` and `compile` commands.

## CLI

### `dzx [script] [...args]`

Run an local or remote dzx script (optional in a web worker).

```shell
dzx --worker ./examplte.ts
```

### `dzx bundle [script]`

Bundle an dzx script to a standalone deno sript. Can also read from stdin.

```shell
dzx bundle ./examplte.ts > bundle.js
deno run --allow-read --allow-env --allow-run bundle.js
```

### `dzx compile [script] [...permissions]`

Combile an dzx script to a standalone binary. Can also read from stdin.

```shell
dzx compile ./examplte.ts --allow-read --allow-env --allow-run
```

### `dzx help [command]`

Show this help or the help of a sub-command.

### `dzx completions [shell]`

Generate shell completions for `bash`, `fish` and `zsh`.

```shell
source <(dzx completions zsh)
```

## API

### Methods

#### `` $`command` ``

Executes a shell command.

```ts
const count = parseInt(await $`ls -1 | wc -l`);
console.log(`Files count: ${count}`);
```

##### `ProcessOutput`

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

##### `ProcessError`

The `ProcessError` class extends from the `Error` class and implements all
properties and methods from `ProcessOutput`.

```ts
class ProcessError extends Error implements ProcessOutput {}
```

If the executed program returns a non-zero exit code, a `ProcessError` will be
thrown.

```ts
try {
  await $`exit 1`;
} catch (process) {
  console.log(`Exit code: ${process.status.code}`);
  console.log(`Error: ${process.stderr}`);
}
```

#### `cd()`

Set the current working directory. If path does not exist, an error is thrown.

#### `` quote`string` ``

The quote methods quotes safly a string. by default the `shq` package is used.
Can be overidden with `$.quote`.

### Modules

#### `$.[style]()`

dzx has chainable ansi color methods that are available on the global `$`
symbol.

```ts
console.log($.blue.bold("Hello world!"));
```

#### `path`

Deno's `std/path` module.

#### `io`

Deno's `std/io` module.

#### `fs`

Deno's `std/fs` module.

#### `log`

Deno's `std/log` module.

#### `flags`

Deno's `std/flags` module.

### Options

#### `$.verbose`

Enable debugging output.

#### `$.shell`

Set the current shel.

#### `$.throwErrors`

Throw errors instead of calling `Deno.exit`.

#### `$.quote`

Parser method that is used to safely quote strings. Used by: `` $`command` ``

## Contributing

Any kind of contribution is welcome!

## License

[MIT](LICENSE)
