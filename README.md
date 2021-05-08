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
    <img alt="Discord" src="https://img.shields.io/badge/deno.land/x/dzx-blue?logo=deno&logoColor=959DA6&color=272727" />
  </a>
</p>

<p align="center">
  <b>Deno shell tools inspired by <a href="https://github.com/google/zx">zx</a></b>
</p>

## Global usage

Install dzx globally

```
deno install --allow-all -r -f https://deno.land/x/dzx/dzx.ts
```

```typescript
#!/usr/bin/env dzx
/// <reference path="https://deno.land/x/dzx/types.d.ts" />

await $`Hello ${$.blue.bold("world")}!`;
```

## Remote usage

```typescript
#!/usr/bin/env deno run --allow-run --allow-read --allow-env https://deno.land/x/dzx/dzx.ts
/// <reference path="https://deno.land/x/dzx/types.d.ts" />

await $`Hello ${$.blue.bold("world")}!`;
```
