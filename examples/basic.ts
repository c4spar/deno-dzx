/// <reference path="https://deno.land/x/dzx@0.2.4/types.d.ts" />

const helloWorld = await $`echo 'Hello World!'`;
console.log(`${$.blue("helloWorld")} result was %o`, helloWorld);

const pwd = await $o`pwd`;
console.log(`Your current working dir is ${pwd}`);
