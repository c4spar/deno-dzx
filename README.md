# dzx

Deno shell tools.

## Example

```typescript
#!/usr/bin/env deno run https://deno.land/x/dzx/dzx.ts
/// <reference path="https://deno.land/x/dzx/types.d.ts" />

await $`Hello ${$.blue.bold("world")}!`;
```