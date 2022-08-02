## Short dev overview

## 1. Basics

As mentioned earlier, Patchron knowledge is based upon patches. Patch contains latest changes done to particular file. To understand it better, here is example of how received data looks like:

```js
// first part (hunk) of file
"@@ -10,13 +10,7 @@ const payload = require('./fixtures/pull_request.opened');\n" +
" const fs = require('fs');\n" +
" const path = require('path');\n" +
' \n' +
'-const {\n' +
'-    describe,\n' +
'-    expect,\n' +
'-    test,\n' +
"-} = require('@jest/globals');\n" +
"+const { expect, test } = require('@jest/globals');\n" +
' \n' +
// second part (hunk) of file
'@@ -27,7 +21,6 @@ const deployment = {\n' +
"         schema: 'rocks!',\n" +
'     },\n' +
"     environment: 'production',\n" +
`-    description: "My Probot App's first deploy!",\n` +
' };\n' +
```

To understand how git identifies what was changed, removed or added (and in which line it happend), check explanation tab:

<details>
<summary>Explanation</summary>

-   line that was added starts with `+`
-   line that was removed starts with `-`
-   line that was unchanged starts with `whitespace`
-   line that begins with `@@` is <em>hunk header</em>. It allows to identify lines in respect to source file. It also informs about hunk length.

Hunk header e.g. `@@ -10,13 +10,7 @@` contains following information:

-   LEFT SIDE `-10,13`
    -   10 is number of first line that starts below hunk header
    -   13 is left side hunk length (sum of unchanged and removed lines)
-   RIGHT SIDE `+10,7`
    -   10 is number of first line that starts below hunk header
    -   7 is right side hunk length (sum of unchanged and added lines)

</details>

## 2. Data processing

In almost all rules in Patchron, received data is organized via [setupData](https://github.com/trolit/Patchron/blob/0cefee8ba7437f55d98c07f3cc67b310851f47d8/src/rules/Base.js#L105) to easier further code analysis. Content is split by newline and each row contains default information mentioned below:

```ts
{
    index: number, // index in relation to full patch
    indentation: number,
    content: string,
    trimmedContent: string
}
```

Few things to note:

-   Indentation can be sometimes a must to identify relation between particular parts of source code.
-   `trimmedContent` and `content` have line state signs removed. To addition content of lines that:
    -   are spacers, are replaced with `<<< newline >>>`
    -   were removed, are replaced with `<<< merge >>>`
    -   were commented, are replaced with `<<< commented >>>`

Rules that require more than single line of patch to perform their checking, are using `getMultiLineStructure` helper. It allows to pass `multiLineOptions` array. Each element is built in the following manner:

```ts
{
    indicator: object|null,       // first line of multi-line
    limiter: object|Array<object> // last line of multi-line
}
```

For more details on how those objects can be arranged, refer to [general type definitions](https://github.com/trolit/Patchron/blob/master/src/config/type-definitions/general.js) or check how it's used in config files.

## 3. Rule creation

Creating new rule is relatively simple. Before making first step, pin to IDE [type definitions](https://github.com/trolit/Patchron/blob/master/src/config/type-definitions/index.js) to see what lies under e.g. `patchronContext`. Copy rule structure from another file or refer to template below and start coding.

```js
const BaseRule = require('src/rules/Base');

class PredefinedFilenamesRule extends BaseRule {
    /**
     * @param {PatchronContext} patchronContext
     * @param {object} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

        // 0. load rule config (if needed)
    }

    invoke() {
        // 1. setup data (if rule targets patch content)
        const { splitPatch } = this.file;

        const data = this.setupData(splitPatch);

        const reviewComments = [];

        // 2. apply logic to determine wrong cases

        // 3. add comments to array

        // 4. done
        return reviewComments;
    }

    /**
     * @returns {string}
     */
    _getCommentBody(filename, expectedName) {
        return '';
    }
}

module.exports = PredefinedFilenamesRule;
```
