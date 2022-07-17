/// <reference path="../globals.ts" />

const helloWorld = await $`echo 'Hello World!'`;
console.log(`${$.blue("helloWorld")} result was %o`, helloWorld);

const pwd = await $o`pwd`;
console.log(`Your current working dir is ${pwd}`);
