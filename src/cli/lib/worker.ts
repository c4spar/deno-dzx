import { bootstrapModule, BootstrapOptions } from "./bootstrap.ts";

export interface Permissions {
  allowAll?: boolean;
  allowEnv?: boolean | string[];
  allowHrtime?: boolean;
  allowFfi?: boolean;
  allowRun?: boolean | (string | URL)[];
  allowWrite?: boolean | (string | URL)[];
  allowNet?: boolean | string[];
  allowRead?: boolean | (string | URL)[];
}

export interface SpawnWorkerOptions extends Omit<BootstrapOptions, "base64"> {
  perms: Permissions;
}

export function spawnWorker({
  args,
  startTime,
  mainModule,
  perms,
}: SpawnWorkerOptions): void {
  new Worker(
    bootstrapModule({
      args: args,
      startTime: startTime,
      mainModule: mainModule,
      base64: true,
      code: `await import("${mainModule}");`,
    }),
    {
      name: mainModule,
      type: "module",
      deno: {
        namespace: true,
        permissions: {
          env: perms.allowAll || perms.allowEnv || false,
          hrtime: perms.allowAll || perms.allowHrtime || false,
          ffi: perms.allowAll || perms.allowFfi || false,
          run: perms.allowAll || perms.allowRun || false,
          write: perms.allowAll || perms.allowWrite || false,
          net: perms.allowAll || perms.allowNet || false,
          read: perms.allowAll || perms.allowRead || false,
        },
      },
    },
  );
}
