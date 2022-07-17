# [0.4.0](https://github.com/c4spar/deno-dzx/compare/0.3.2...0.4.0) (Jul 17, 2022)

### BREAKING CHANGES

- **runtime:** remove `$.throwErrors` (#77)
  ([0fc54c8](https://github.com/c4spar/deno-dzx/commit/0fc54c8))
- **runtime:** remove `$s` shorthand in favor of `statusCode` (#75)
  ([5a8a218](https://github.com/c4spar/deno-dzx/commit/5a8a218))

### Features

- **runtime:** add `.cwd()` method (#95)
  ([4b88438](https://github.com/c4spar/deno-dzx/commit/4b88438))
- **runtime:** add `.env()` method (#94)
  ([ca64927](https://github.com/c4spar/deno-dzx/commit/ca64927))
- **runtime:** add `.retry()` callback handler (#89)
  ([34984c2](https://github.com/c4spar/deno-dzx/commit/34984c2))
- **runtime:** add `stdout` and `stderr` properties (#83, #92)
  ([7a216e6](https://github.com/c4spar/deno-dzx/commit/7a216e6),
  [6f93d58](https://github.com/c4spar/deno-dzx/commit/6f93d58))
- **runtime:** capture stack trace for `cd` method and fmt error message (#78)
  ([b59e737](https://github.com/c4spar/deno-dzx/commit/b59e737))

### Bug Fixes

- **runtime:** add missing import (#87)
  ([3e52bfb](https://github.com/c4spar/deno-dzx/commit/3e52bfb))
- **runtime:** don't inject globals by default (#72)
  ([ff9910e](https://github.com/c4spar/deno-dzx/commit/ff9910e))

### Code Refactoring

- **runtime:** move `std` modules to a separate sub-folder and add `shell.ts`
  entry file (#91)
  ([76b9e72](https://github.com/c4spar/deno-dzx/commit/76b9e72))

### Documentation Updates

- refactor docs (#93)
  ([5b7fe67](https://github.com/c4spar/deno-dzx/commit/5b7fe67))
- fix typo ([6082c1d](https://github.com/c4spar/deno-dzx/commit/6082c1d))
- update readme (#84)
  ([0082131](https://github.com/c4spar/deno-dzx/commit/0082131))
- **runtime:** add `.cwd()` docs
  ([917b90a](https://github.com/c4spar/deno-dzx/commit/917b90a))
- **runtime:** improve `Process` docs (#90)
  ([5e4d818](https://github.com/c4spar/deno-dzx/commit/5e4d818))

# [0.3.2](https://github.com/c4spar/deno-dzx/compare/0.3.1...0.3.2) (Jul 11, 2022)

### Features

- **cli:** start repl by default and print dzx version on start (#34)
  ([ce2a1c7](https://github.com/c4spar/deno-dzx/commit/ce2a1c7))
- **cli:** add `--verbose` option and change `$.verbose` type from `boolean` to
  `boolean | number` (#30)
  ([c253d77](https://github.com/c4spar/deno-dzx/commit/c253d77))
- **runtime:** add `.delay()` method (#68)
  ([a05e1ab](https://github.com/c4spar/deno-dzx/commit/a05e1ab))
- **runtime:** add `.timeout()` method (#67)
  ([8219581](https://github.com/c4spar/deno-dzx/commit/8219581))
- **runtime:** add `kill` method (#64)
  ([0d0044b](https://github.com/c4spar/deno-dzx/commit/0d0044b))
- **runtime:** add `statusCode` property (#63)
  ([eb85a1b](https://github.com/c4spar/deno-dzx/commit/eb85a1b))
- **runtime:** add `noThrow` property (#62)
  ([dcaa0e8](https://github.com/c4spar/deno-dzx/commit/dcaa0e8))
- **runtime:** add `pid` property (#61)
  ([66d9c6a](https://github.com/c4spar/deno-dzx/commit/66d9c6a))
- **runtime:** add `.retry()` method and print retries on error (#58)
  ([a04d370](https://github.com/c4spar/deno-dzx/commit/a04d370))
- **runtime:** capture stack trace from `$` call's (#44)
  ([7c06a04](https://github.com/c4spar/deno-dzx/commit/7c06a04))
- **runtime:** print exit code info and signal on error (#43)
  ([9cc7ec9](https://github.com/c4spar/deno-dzx/commit/9cc7ec9))

### Bug Fixes

- **cli:** fix base64 module bootstrapping (#31)
  ([3292575](https://github.com/c4spar/deno-dzx/commit/3292575))
- **runtime:** make readlines aboartable (#65)
  ([b737487](https://github.com/c4spar/deno-dzx/commit/b737487))

### Code Refactoring

- **bundle:** use deno_emit for bundling (#36)
  ([3050c89](https://github.com/c4spar/deno-dzx/commit/3050c89))
- **cli:** remove useRawArgs from eval command (#35)
  ([0bf9a2e](https://github.com/c4spar/deno-dzx/commit/0bf9a2e))
- **cli:** refactor repl options handling (#33)
  ([607b12a](https://github.com/c4spar/deno-dzx/commit/607b12a))
- **runtime:** use dynamic import for emit module to improve cli performance
  (#70) ([fa9e52f](https://github.com/c4spar/deno-dzx/commit/fa9e52f))
- **runtime:** implement process class (#42)
  ([2059567](https://github.com/c4spar/deno-dzx/commit/2059567))
- **runtime:** make `$.mainModule`, `$.args` & `$.startTime` readonly (#32)
  ([bcb02fd](https://github.com/c4spar/deno-dzx/commit/bcb02fd))

### Chore

- **ci:** install zsh on canary gh action (#41)
  ([a464b58](https://github.com/c4spar/deno-dzx/commit/a464b58))
- **ci:** setup zsh in gh action
  ([615f826](https://github.com/c4spar/deno-dzx/commit/615f826))
- **ci:** run workflows on pull request (#37)
  ([6d1699c](https://github.com/c4spar/deno-dzx/commit/6d1699c))
- **ci:** re-enable coverage and upgrade codecov/codecov-action to v3 (#15)
  ([2668379](https://github.com/c4spar/deno-dzx/commit/2668379))
- **ci:** upgrade checkout action to v3 (#29)
  ([006c8ce](https://github.com/c4spar/deno-dzx/commit/006c8ce))
- **upgrade:** deno/std@0.140.0, cliffy@0.24.2 (#38)
  ([27923c6](https://github.com/c4spar/deno-dzx/commit/27923c6))
- **upgrade:** deno/std@v0.136.0, cliffy@v0.23.1 (#28)
  ([0d70bc7](https://github.com/c4spar/deno-dzx/commit/0d70bc7))

# [0.3.1](https://github.com/c4spar/deno-dzx/compare/0.3.0...0.3.1) (Mar 20, 2022)

### Features

- **cli:** Add repl command (#20)
  ([5850a4d](https://github.com/c4spar/deno-dzx/commit/5850a4d))
- **cli:** add eval command (#23)
  ([f613be7](https://github.com/c4spar/deno-dzx/commit/f613be7))

### Bug Fixes

- **cli:** throw errors in repl (#24)
  ([b3b7bc6](https://github.com/c4spar/deno-dzx/commit/b3b7bc6))

### Code Refactoring

- **cli:** refactor runtime bootstrapping (#22)
  ([c86b667](https://github.com/c4spar/deno-dzx/commit/c86b667))

### Chore

- **upgrade:** deno/std@v0.130.0, cliffy@v0.22.2 (#25)
  ([d97535e](https://github.com/c4spar/deno-dzx/commit/d97535e))

### Documentation Updates

- bump version to 0.3.1
  ([4570b37](https://github.com/c4spar/deno-dzx/commit/4570b37))
- update readme ([528228b](https://github.com/c4spar/deno-dzx/commit/528228b))

# [0.3.0](https://github.com/c4spar/deno-dzx/compare/0.2.4...0.3.0) (Nov 9, 2021)

### Features

- **cli:** add the ability to run markdown files (#2)
  ([933149b](https://github.com/c4spar/deno-dzx/commit/933149b))
- **runtime:** add streams module (#12)
  ([62eb4ed](https://github.com/c4spar/deno-dzx/commit/62eb4ed))
- **runtime:** add $s, $o and $e shorthands (#3)
  ([d7f40a6](https://github.com/c4spar/deno-dzx/commit/d7f40a6))

### Bug Fixes

- **compile:** ensure flags are properly parsed and embedded (#5)
  ([2b16240](https://github.com/c4spar/deno-dzx/commit/2b16240))
- **runtime:** ensure $.args is populated for bundled/compiled scripts (#10)
  ([db61cd9](https://github.com/c4spar/deno-dzx/commit/db61cd9))

### Code Refactoring

- default to unknown in catch variables (#14)
  ([60ab69c](https://github.com/c4spar/deno-dzx/commit/60ab69c))
- **cli:** move worker and markdown code into separate files (#13)
  ([8218d23](https://github.com/c4spar/deno-dzx/commit/8218d23))

### Chore

- **ci:** fix workflow names
  ([0b7c673](https://github.com/c4spar/deno-dzx/commit/0b7c673))
- **ci:** split workflow files, add canary test's and generate code coverage
  (#9) ([da153f4](https://github.com/c4spar/deno-dzx/commit/da153f4))
- **upgrade:** deno/std v0.113.0 (#16)
  ([c2e28ec](https://github.com/c4spar/deno-dzx/commit/c2e28ec))

### Unit/Integration Tests

- **runtime:** add process output and process error test's (#11)
  ([f3d513a](https://github.com/c4spar/deno-dzx/commit/f3d513a))

### Documentation Updates

- update readme ([215059f](https://github.com/c4spar/deno-dzx/commit/215059f))

# [v0.2.4](https://github.com/c4spar/deno-dzx/compare/0.2.3...0.2.4) (2021-08-14)

### Features

- **cli:** add upgrade command
  ([08981fe](https://github.com/c4spar/deno-dzx/commit/08981fe))

### Bug Fixes

- **cli:** replace --allow-plugin with --allow-ffi
  ([ede926d](https://github.com/c4spar/deno-dzx/commit/ede926d))
- **cli:** exclude source maps from bundle command
  ([0da5a1e](https://github.com/c4spar/deno-dzx/commit/0da5a1e))
- **runtime:** take only stdout when passing a process output to another process
  ([0da5a1e](https://github.com/c4spar/deno-dzx/commit/0da5a1e))

### Code Refactoring

- **cli:** exit with exit code 2 if reading from stdin fails
  ([5911dff](https://github.com/c4spar/deno-dzx/commit/5911dff))
- **runtime:** add typings in runtime files
  ([2b5656b](https://github.com/c4spar/deno-dzx/commit/2b5656b))
- **runtime:** change default shell to bash
  ([513a4da](https://github.com/c4spar/deno-dzx/commit/513a4da))

### Chore

- **ci:** switch to denoland/setup-deno action
  ([b163313](https://github.com/c4spar/deno-dzx/commit/b163313))
- **ci:** add testing step to github action
  ([c2b7a5b](https://github.com/c4spar/deno-dzx/commit/c2b7a5b))
- **upgrade:** deno/std v0.104.0
  ([513a4da](https://github.com/c4spar/deno-dzx/commit/513a4da),
  [0e8d0a7](https://github.com/c4spar/deno-dzx/commit/0e8d0a7))
- **upgrade:** cliffy v0.19.5
  ([fd82808](https://github.com/c4spar/deno-dzx/commit/fd82808))

### Unit/Integration Tests

- test behavior of passing exec result to another exec call
  ([21f78c0](https://github.com/c4spar/deno-dzx/commit/21f78c0))
- add a basic set of test cases
  ([8673e8c](https://github.com/c4spar/deno-dzx/commit/8673e8c))
- get the initial test suite passing
  ([1e57841](https://github.com/c4spar/deno-dzx/commit/1e57841))
- add initial tests
  ([c90ea2a](https://github.com/c4spar/deno-dzx/commit/c90ea2a))

### Documentation Updates

- fix typo ([a00b7fd](https://github.com/c4spar/deno-dzx/commit/a00b7fd))

# [v0.2.3](https://github.com/c4spar/deno-dzx/compare/0.2.2...0.2.3) (2021-05-14)

### Features

- add $.prefix ([4ba75ac](https://github.com/c4spar/deno-dzx/commit/4ba75ac))

### Bug Fixes

- add time logging to bundle
  ([a4021ac](https://github.com/c4spar/deno-dzx/commit/a4021ac))

### Chore

- fmt ([e6b91c9](https://github.com/c4spar/deno-dzx/commit/e6b91c9))

### Documentation Updates

- update readme ([cece53c](https://github.com/c4spar/deno-dzx/commit/cece53c),
  [4b707a4](https://github.com/c4spar/deno-dzx/commit/4b707a4))

# [v0.2.2](https://github.com/c4spar/deno-dzx/compare/0.2.1...0.2.2) (2021-05-14)

### Features

- add log types to log namespace
  ([62db895](https://github.com/c4spar/deno-dzx/commit/62db895))
- add io types to io namespace
  ([3bdd903](https://github.com/c4spar/deno-dzx/commit/3bdd903))
- add path types to path namespace
  ([99a3913](https://github.com/c4spar/deno-dzx/commit/99a3913))
- add async types to async namespace
  ([b22b929](https://github.com/c4spar/deno-dzx/commit/b22b929))
- add flags types to flags namespace
  ([0963dc0](https://github.com/c4spar/deno-dzx/commit/0963dc0))
- add $.args ([b1cdd29](https://github.com/c4spar/deno-dzx/commit/b1cdd29))

### Bug Fixes

- fix flags types ([6ea60c6](https://github.com/c4spar/deno-dzx/commit/6ea60c6))

### Chore

- fix changelog links
  ([f74b9a2](https://github.com/c4spar/deno-dzx/commit/f74b9a2))

### Documentation Updates

- update readme ([b7d4136](https://github.com/c4spar/deno-dzx/commit/b7d4136),
  [4ef155e](https://github.com/c4spar/deno-dzx/commit/4ef155e),
  [5991b6e](https://github.com/c4spar/deno-dzx/commit/5991b6e))

# [v0.2.1](https://github.com/c4spar/deno-dzx/compare/0.2.0...0.2.1) (2021-05-14)

### Features

- add $.stdout and $.stderr
  ([9d9938c](https://github.com/c4spar/deno-dzx/commit/9d9938c),
  [a191df6](https://github.com/c4spar/deno-dzx/commit/a191df6),
  [9b90325](https://github.com/c4spar/deno-dzx/commit/9b90325))

### Bug Fixes

- fix cd method ([27b0d9d](https://github.com/c4spar/deno-dzx/commit/27b0d9d))

### Chore

- fmt ([74a9de0](https://github.com/c4spar/deno-dzx/commit/74a9de0))

### Documentation Updates

- update readme ([6636b67](https://github.com/c4spar/deno-dzx/commit/6636b67),
  [5663be0](https://github.com/c4spar/deno-dzx/commit/5663be0))

# [v0.2.0](https://github.com/c4spar/deno-dzx/compare/0.1.1...0.2.0) (2021-05-13)

### Features

- add support for home directory "~" in cd
  ([a534ea9](https://github.com/c4spar/deno-dzx/commit/a534ea9))
- support absolute path in cd
  ([c8d8f72](https://github.com/c4spar/deno-dzx/commit/c8d8f72))
- add $.startTime and $.time
  ([02cb655](https://github.com/c4spar/deno-dzx/commit/02cb655))
- add $.mainModule
  ([fd5f8b5](https://github.com/c4spar/deno-dzx/commit/fd5f8b5))
- add worker and permissions support
  ([838cfbe](https://github.com/c4spar/deno-dzx/commit/838cfbe),
  [fb990c5](https://github.com/c4spar/deno-dzx/commit/fb990c5))
- add bundle and compile command
  ([c2e9a29](https://github.com/c4spar/deno-dzx/commit/c2e9a29),
  [9daafd2](https://github.com/c4spar/deno-dzx/commit/9daafd2),
  [8e4b385](https://github.com/c4spar/deno-dzx/commit/8e4b385),
  [c87b793](https://github.com/c4spar/deno-dzx/commit/c87b793),
  [dd95c08](https://github.com/c4spar/deno-dzx/commit/dd95c08))
- add throw errors
  ([8177dd4](https://github.com/c4spar/deno-dzx/commit/8177dd4),
  [f0f6899](https://github.com/c4spar/deno-dzx/commit/f0f6899))
- add async, path, io, fs, log and flags module
  ([f49c4f2](https://github.com/c4spar/deno-dzx/commit/f49c4f2),
  [ee95ee5](https://github.com/c4spar/deno-dzx/commit/ee95ee5),
  [bb4830d](https://github.com/c4spar/deno-dzx/commit/bb4830d),
  [269ba69](https://github.com/c4spar/deno-dzx/commit/269ba69),
  [f599187](https://github.com/c4spar/deno-dzx/commit/f599187),
  [e8fb41f](https://github.com/c4spar/deno-dzx/commit/e8fb41f),
  [ee95ee5](https://github.com/c4spar/deno-dzx/commit/ee95ee5))
- add version file
  ([ebc6143](https://github.com/c4spar/deno-dzx/commit/ebc6143))

### Bug Fixes

- fix cd method ([bf39b0a](https://github.com/c4spar/deno-dzx/commit/bf39b0a),
  [111d41c](https://github.com/c4spar/deno-dzx/commit/111d41c))

### Code Refactoring

- refactor error method
  ([562b65f](https://github.com/c4spar/deno-dzx/commit/562b65f))
- remove $.cwd and use Deno.chdir for cd
  ([33e097a](https://github.com/c4spar/deno-dzx/commit/33e097a))
- use cliffy for command line interfaces
  ([51c234b](https://github.com/c4spar/deno-dzx/commit/51c234b),
  [95e6f3c](https://github.com/c4spar/deno-dzx/commit/95e6f3c))

### Chore

- fmt ([38b2d38](https://github.com/c4spar/deno-dzx/commit/38b2d38))

### Documentation Updates

- update readme ([23a95e6](https://github.com/c4spar/deno-dzx/commit/23a95e6),
  [251add4](https://github.com/c4spar/deno-dzx/commit/251add4),
  [e73f3a6](https://github.com/c4spar/deno-dzx/commit/e73f3a6),
  [f1a0159](https://github.com/c4spar/deno-dzx/commit/f1a0159),
  [7808143](https://github.com/c4spar/deno-dzx/commit/7808143),
  [cb1418a](https://github.com/c4spar/deno-dzx/commit/cb1418a),
  [3542c19](https://github.com/c4spar/deno-dzx/commit/3542c19),
  [33918ae](https://github.com/c4spar/deno-dzx/commit/33918ae))
- add changelog ([02d5f2e](https://github.com/c4spar/deno-dzx/commit/02d5f2e))

# [v0.1.1](https://github.com/c4spar/deno-dzx/compare/0.1.0...0.1.1) (2021-05-08)

### Bug Fixes

- fix dependency url
  ([0db20d6](https://github.com/c4spar/deno-dzx/commit/0db20d6))

# [v0.1.0](https://github.com/c4spar/deno-dzx/compare/215dba4...0.1.0) (2021-05-08)

- Revert "refactor: import from path instead of data url"
  ([4ee4800](https://github.com/c4spar/deno-dzx/commit/4ee4800),
  [b99669e](https://github.com/c4spar/deno-dzx/commit/b99669e))

### Features

- add quote method to global space and remove cd from $ symbol
  ([866793c](https://github.com/c4spar/deno-dzx/commit/866793c))
- add cd to global namespace
  ([855a800](https://github.com/c4spar/deno-dzx/commit/855a800))
- escape template literal params
  ([0bf5920](https://github.com/c4spar/deno-dzx/commit/0bf5920))
- add $.cd ([9dafdfd](https://github.com/c4spar/deno-dzx/commit/9dafdfd))
- add support for $.shell, execute from url and from stdin
  ([c37e32b](https://github.com/c4spar/deno-dzx/commit/c37e32b))

### Bug Fixes

- fix import local file
  ([9b1840f](https://github.com/c4spar/deno-dzx/commit/9b1840f))
- use data url to import local file
  ([9be2e02](https://github.com/c4spar/deno-dzx/commit/9be2e02))
- fix import path ([d9bb2f9](https://github.com/c4spar/deno-dzx/commit/d9bb2f9))

### Code Refactoring

- remove example file
  ([247713a](https://github.com/c4spar/deno-dzx/commit/247713a))
- import from path instead of data url
  ([ad6431a](https://github.com/c4spar/deno-dzx/commit/ad6431a))
- remove recursive imports
  ([a8226a4](https://github.com/c4spar/deno-dzx/commit/a8226a4))
- refactor folder structure and add mod.ts file
  ([907a7a1](https://github.com/c4spar/deno-dzx/commit/907a7a1))
- rename ProcessResult to ProcessOutput
  ([9ce1a61](https://github.com/c4spar/deno-dzx/commit/9ce1a61))
- use combined as error message
  ([8e994b9](https://github.com/c4spar/deno-dzx/commit/8e994b9))

### Chore

- fmt ([91e668c](https://github.com/c4spar/deno-dzx/commit/91e668c))
- **ci:** add lint workflow
  ([12bdbca](https://github.com/c4spar/deno-dzx/commit/12bdbca))

### Documentation Updates

- update readme ([7e5473c](https://github.com/c4spar/deno-dzx/commit/7e5473c),
  [cbd5d8b](https://github.com/c4spar/deno-dzx/commit/cbd5d8b),
  [743b6a3](https://github.com/c4spar/deno-dzx/commit/743b6a3),
  [e52fe7a](https://github.com/c4spar/deno-dzx/commit/e52fe7a),
  [6209106](https://github.com/c4spar/deno-dzx/commit/6209106))
- add documentation
  ([730aed0](https://github.com/c4spar/deno-dzx/commit/730aed0))
- fix img alt ([1683984](https://github.com/c4spar/deno-dzx/commit/1683984))
- add license ([3b7be1e](https://github.com/c4spar/deno-dzx/commit/3b7be1e))
- set supported deno version to v1.7.0
  ([19152fb](https://github.com/c4spar/deno-dzx/commit/19152fb))
- fix example ([b843880](https://github.com/c4spar/deno-dzx/commit/b843880))
- add reamde ([e695b06](https://github.com/c4spar/deno-dzx/commit/e695b06))
