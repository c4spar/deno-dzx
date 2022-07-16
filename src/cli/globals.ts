import * as std from "../std/mod.ts";
import * as runtime from "../runtime/mod.ts";

export function initGlobals() {
  Object.assign(self, std);
  Object.assign(self, runtime);
}
