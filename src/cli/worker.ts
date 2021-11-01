import { $ } from "../runtime/mod.ts";

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

export function spawnWorker(perms: Permissions): void {
  new Worker(
    `data:application/typescript,${
      encodeURIComponent(`
          import "${new URL("./src/runtime/mod.ts", Deno.mainModule)}";
          $.mainModule = "${$.mainModule}";
          $.startTime = ${$.startTime};
          $.args = JSON.parse(decodeURIComponent("${
        encodeURIComponent(JSON.stringify($.args))
      }"));
          await import("${$.mainModule}");
          if ($.verbose) {
            console.log($.bold("time: %ss"), Math.round($.time) / 1000);
          }
          self.close();`)
    }`,
    {
      name: $.mainModule,
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
