<h1 align="center">❯ DZX</h1>

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
await $`mkdir /tmp/${name}`;
```

## Content

- [Install](#install)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Install

```
deno install --allow-all -r -f https://deno.land/x/dzx/dzx.ts
```

## Documentation

You can write your scripts in a file with .js, .mjs or .ts extension.

Add next shebang at the beginning of your script:

```
#!/usr/bin/env zx
```

Now you will be able to run your script as:

```shell
chmod +x ./script.js
./script.js
```

If you want to use typescript you need to add a tripple slash reference for the
typings at the top of the file, but not before the shebang line.

```
#!/usr/bin/env zx
/// <reference path="https://deno.land/x/dzx/types.d.ts" />
```

Now you will be able to run your typescript script the same way as your js
script:

```shell
chmod +x ./script.ts
./script.ts
```

You can also import all symbol directly from `dzx/mod.ts` instead of using
globals.

```ts
#!/usr/bin/env zx
import { $ } from "https://deno.land/x/dzx/mod.ts";
```

### `$.verbose`

Enable debugging output.

### `$.shell`

Set the current shel.

### `$.cwd`

Set the current working directory.

### `` $`command` ``

```ts
const count = parseInt(await $`ls -1 | wc -l`);
console.log(`Files count: ${count}`);
```

#### `ProcessOutput`

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

#### `ProcessError`

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

### `cd()`

The global available cd method to sets the current working directory. Also
available on the global `$` symbol.

### `$.[style]()`

dzx has chainable color methods that are available on the global `$` symbol.

```ts
console.log($.blue.bold("Hello world!"));
```

## Remote usage

```typescript
#!/usr/bin/env deno run --allow-run --allow-read --allow-env https://deno.land/x/dzx/dzx.ts
/// <reference path="https://deno.land/x/dzx/types.d.ts" />

console.log(`Hello ${$.blue.bold("world")}!`);
```

## Contributing

Any kind of contribution is welcome!

## License

[MIT](LICENSE)
