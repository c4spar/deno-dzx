# dzx

Deno shell tools.

## Install globally

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
