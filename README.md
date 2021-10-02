# UserScript Meta Generator

> Generating UserScript headers with ease.

## 📥 Installation

Via NPM:

```sh
npm install --save-dev userscript-meta-generator
```

or using Yarn:

```
yarn add --dev userscript-meta-generator
```

## 🔧 Usage

```
import { createGenerator } from "userscript-meta-generator";
```

This will export a function `createGenerator` with the following signature:

> `createGenerator(opts?: GeneratorOptionsInput): Generator`

The `Generator` is function that accepts an object with UserScript metadata and
produces a heading comment that you normally embed at the beginning of your
script.

This library is written in TypeScript and it generates declarations that can
power up your IDE and help validate the values and suggest properties. There are
also a couple of enum exports, like `CommentType`, `RunAt`, etc.

You can use it with Rollup through the [`rollup-plugin-license`][license_plug]:

<details>
<summary>Example of <code>userScriptHeader</code> plugin</summary>

This example is written in TypeScript!

```ts
import type { Plugin } from "rollup";
import {
  CommentStyle,
  createGenerator,
  GeneratorOptionsInput,
  UserScriptMeta,
} from "userscript-header-generator";
import license from "rollup-plugin-license";

type StrippedGeneratorOptions = Omit<GeneratorOptionsInput, "commentStyle">;

/**
 * Represents options for the userScriptHeader Rollup plugin.
 */
interface IUserScriptHeaderOptions {
  /**
   * A UserScript metadata or a function that returns that metadata.
   */
  meta: UserScriptMeta | (() => UserScriptMeta);

  /**
   * Options for the header generator.
   *
   * `commentStyle` option is stripped of and always set to `"none"`.
   */
  generatorOptions: StrippedGeneratorOptions;

  /**
   * Whether the source map should be generated.
   */
  sourceMap?: boolean;
}

/**
 * Creates a new Rollup plugin that inserts UserScript header.
 *
 * @param opts Options for the plugin.
 * @returns UserScript header.
 */
export function userScriptHeader(opts: IUserScriptHeaderOptions): Plugin {
  const { generatorOptions, meta, sourceMap } = opts;

  const generate = createGenerator({
    ...generatorOptions,
    commentStyle: CommentStyle.None,
  });

  const bannerImpl = license({
    banner: {
      content: "<%= data.content %>",
      commentStyle: "slash",
      data() {
        return {
          content: generate(typeof meta === "function" ? meta() : meta),
        };
      },
    },
    sourcemap: sourceMap,
  });

  return {
    ...bannerImpl,
    name: "UserScript Header",
  };
}
```

</details>

[license_plug]: http://npm.im/rollup-plugin-license
