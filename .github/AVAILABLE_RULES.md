# Available rules

🛈 Common rules are the ones that potentionally could be used in more than single extension (at least two)

<!-- ********************************************************** -->
<!-- BEGIN COMMON RULES -->
<!-- ********************************************************** -->

<table>
<caption><h2>📐Common</h2></caption>

<tr>
<td>Rule 📌</td>
<td>Config example ⚙️</td>
<td>Description ⚙️</td>

</tr>

<!-- *************************** -->

<tr>
<td>

[ComparisionOperatorLevel](../src/rules/v1/common/ComparisionOperatorLevel.js)

([config definition](../src/type-definitions/rules/v1/common/ComparisionOperatorLevel.js))

</td>
<td>

```json
{
    "allowedLevels": [1, 2]
}
```

</td>
<td>
<p align="justify">tests equality/inequality level. Has three levels. Due to the fact that PHP also includes strict/weak equality/inequality feature, it was placed in common category.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[FixedLoopLengthCondition](../src/rules/v1/common/FixedLoopLengthCondition.js)

([config definition](../src/type-definitions/rules/v1/common/FixedLoopLengthCondition.js))

</td>
<td>

```json
{
    "regex": "(\\w+).length"
}
```

</td>
<td>
<p align="justify">designed to check <strong>for/while/do..while</strong> loops and comment out <strong>.length</strong> reference in condition statement. Expression can be adjusted to e.g. fit other language length calling.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[KeywordsOrderedByLength](../src/rules/v1/common/KeywordsOrderedByLength.js)

([config definition](../src/type-definitions/rules/v1/common/KeywordsOrderedByLength.js))

</td>
<td>

```json
{
    "keywords": [
        {
            "name": "require (packages)",
            "regex": "require(?!.*@).*",
            "order": "ascending",
            "ignoreNewline": false
        },
        {
            "name": "require (other)",
            "regex": "require.*@.*",
            "order": "ascending",
            "ignoreNewline": false
        }
    ]
}
```

</td>
<td>
<p align="justify">tests configured keywords order. If there is a need in ordering packages and other imports separately, try to define two distinct keywords. In provided example (at) is used to differentiate two groups.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[LineBreakBeforeReturn](../src/rules/v1/common/LineBreakBeforeReturn.js)

</td>
<td>❎</td>
<td>
<p align="justify">checks whether `return` statements should be preceded with line-break.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[MarkedComments](../src/rules/v1/common/MarkedComments.js)

([config definition](../src/type-definitions/rules/v1/common/MarkedComments.js))

</td>
<td>

```json
{
    "prefixes": [
        {
            "value": "@TODO",
            "meaning": "not implemented feature"
        }
    ],
    "isAppliedToSingleLineComments": true,
    "isAppliedToMultiLineComments": true,
    "isAppliedToInlineComments": true
}
```

</td>
<td>
<p align="justify">reviews whether <strong>//</strong> or <strong>/* */</strong> comments start with at least one of the predefined prefixes. Combine it with e.g. <a href="https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments">Better Comments</a> extension.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[PositionedKeywords](../src/rules/v1/common/PositionedKeywords.js)

([config definition](../src/type-definitions/rules/v1/common/PositionedKeywords.js))

</td>
<td>

```json
{
    "keywords": [
        {
            "name": "import",
            "regex": "import.*",
            "position": {
                "custom": {
                    "name": "<script>",
                    "regex": "<script>"
                },
                "BOF": false
            },
            "maxLineBreaks": 0,
            "enforced": true,
            "breakOnFirstOccurence": false,
            "countDifferentCodeAsLineBreak": false,
            "multiLineOptions": [
                {
                    "indicator": {
                        "notIncludes": "from"
                    },
                    "limiter": {
                        "startsWith": "} from"
                    }
                }
            ],
            "order": [
                {
                    "name": "packages",
                    "regex": "import(?!.*@).*"
                },
                {
                    "name": "other",
                    "regex": "import.*"
                }
            ]
        }
    ]
}
```

</td>
<td>
<p align="justify">tests configured keywords position. Position can be BOF (beginning of file) or custom. If default position is not found (and keyword has <strong>enforced</strong> flag set to true), first matched occurence of keyword is used as position. It's highly recommended to use <strong>enforced</strong> flag as in 99% cases patches won't contain first line.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[PredefinedFilenames](../src/rules/v1/common/PredefinedFilenames.js)

([config definition](../src/type-definitions/rules/v1/common/PredefinedFilenames.js))

</td>
<td>

```json
{
    "restrictions": [
        {
            "path": "backend/src/controllers/*",
            "expectedName": ".*Controller.js"
        }
    ]
}
```

</td>
<td>
<p align="justify">checks names of files based on configured restrictions. For instance files in <strong>backend/controllers/*</strong> could be restricted with <strong>[a-z].*Controller.js</strong> regex.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[SingleLineBlockPattern](../src/rules/v1/common/SingleLineBlockPattern.js)

([config definition](../src/type-definitions/rules/v1/common/SingleLineBlockPattern.js))

</td>
<td>❎</td>
<td>
<p align="justify">tests single line blocks curly braces presence depending on configuration. Config not included due to complicated structure. <br/><br/> ⚠️ If you want to include that rule, copy config from default rules file which you can find <a href="https://github.com/trolit/Patchron/blob/master/src/config/rules.json">here</a>.
</p>
</td>
</tr>

<!-- *************************** -->

</table>

<!-- ********************************************************** -->
<!-- BEGIN HTML RULES -->
<!-- ********************************************************** -->

<table>
<caption><h2>📐HTML</h2></caption>

<tr>
<td>Rule 📌</td>
<td>Config example ⚙️</td>
<td>Description ⚙️</td>

</tr>

<!-- *************************** -->

<tr>
<td>

[MarkedComments](../src/rules/v1/html/MarkedComments.js)

([config definition](../src/type-definitions/rules/v1/html/MarkedComments.js))

</td>
<td>

```json
{
    "prefixes": [
        {
            "value": "@TODO",
            "meaning": "not implemented feature"
        }
    ]
}
```

</td>
<td>
<p align="justify">
test whether <code>&lt;!-- --&gt;</code> comments start with at least one of the configured prefixes.
</p>
</td>
</tr>

<!-- *************************** -->

</table>

<!-- ********************************************************** -->
<!-- BEGIN JAVASCRIPT RULES -->
<!-- ********************************************************** -->

<table>
<caption><h2>JavaScript</h2></caption>

<tr>
<td>Rule 📌</td>
<td>Config example ⚙️</td>
<td>Description ⚙️</td>

</tr>

<!-- *************************** -->

<tr>
<td>

[AsynchronousPattern](../src/rules/v1/js/AsynchronousPattern.js)

([config definition](../src/type-definitions/rules/v1/js/AsynchronousPattern.js))

</td>
<td>

```json
{
    "pattern": "await"
}
```

</td>
<td>
<p align="justify">
tests whether configured asynchronous pattern is used.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[ImplicitIndexFileImport](../src/rules/v1/js/ImplicitIndexFileImport.js)

([config definition](../src/type-definitions/rules/v1/js/ImplicitIndexFileImport.js))

</td>
<td>

```json
{
    "type": "commonjs"
}
```

</td>
<td>
<p align="justify">
ensures that <strong>import/require</strong> statements that target <strong>index</strong> file are not referenced explictly.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[ImportWithoutExtension](../src/rules/v1/js/ImportWithoutExtension.js)

([config definition](../src/type-definitions/rules/v1/js/ImportWithoutExtension.js))

</td>
<td>

```json
{
    "type": "module"
}
```

</td>
<td>
<p align="justify">
checks whether <strong>import</strong> or <strong>require</strong> statements do not end with extension.</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[IndividualMethodImport](../src/rules/v1/js/IndividualMethodImport.js)

([config definition](../src/type-definitions/rules/v1/js/IndividualMethodImport.js))

</td>
<td>

```json
{
    "packages": [
        {
            "name": "lodash",
            "regex": "[(|'|\"|`]lodash[)|'|\"|`]"
        }
    ]
}
```

</td>
<td>
<p align="justify">
allows to define set of packages which methods should be <strong>imported/required</strong> one by one e.g. `lodash`.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[SimpleComparision](../src/rules/v1/js/SimpleComparision.js)

([config definition](../src/type-definitions/rules/v1/js/SimpleComparision.js))

</td>
<td>

```json
{
    "patterns": [
        {
            "name": "ne (-1)",
            "regex": "!={1,2}(\\s)*?-1",
            "comment": "`value !== -1` -> `~value`"
        }
    ]
}
```

</td>
<td>
<p align="justify">
allows to define simple patterns that are expected to have simplified form like <strong>test !== -1 -> ~test</strong>.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[SimplePropertyAssignment](../src/rules/v1/js/SimplePropertyAssignment.js)

</td>
<td>❎</td>
<td>
<p align="justify">
looks after redundant value assignment to property of the same name e.g. <strong>test1: test1</strong>.
</p>
</td>
</tr>

<!-- *************************** -->

</table>

<!-- ********************************************************** -->
<!-- BEGIN PULL RULES -->
<!-- ********************************************************** -->

<table>
<caption><h2>Pull</h2></caption>

<tr>
<td>Rule 📌</td>
<td>Config example ⚙️</td>
<td>Description ⚙️</td>

</tr>

<!-- *************************** -->

<tr>
<td>

[StrictWorkflow](../src/rules/v1/pull/StrictWorkflow.js)

([config definition](../src/type-definitions/rules/v1/pull/StrictWorkflow.js))

</td>
<td>

```json
{
    "workflow": [
        {
            "base": "master",
            "head": "release"
        },
        {
            "base": "develop",
            "head": "release"
        },
        {
            "base": "develop",
            "head": "feature"
        },
        {
            "base": "master",
            "head": "hotfix"
        },
        {
            "base": "develop",
            "head": "hotfix"
        }
    ],
    "abortReviewOnInvalidFlow": false,
    "abortReviewOnInvalidBranchPrefix": false
}
```

</td>
<td>
<p align="justify">
checks workflow of issued pull request and prefix of the branch. Can be configured to abort further (files) review.
</p>
</td>

</tr>

<!-- *************************** -->

</table>

<!-- ********************************************************** -->
<!-- BEGIN VUE RULES -->
<!-- ********************************************************** -->

<table>
<caption><h2>Vue</h2></caption>

<tr>
<td>Rule 📌</td>
<td>Config example ⚙️</td>
<td>Description ⚙️</td>

</tr>

<!-- *************************** -->

<tr>
<td>

[NormalizedEventHandler](../src/rules/v1/vue/NormalizedEventHandler.js)

([config definition](../src/type-definitions/rules/v1/vue/NormalizedEventHandler.js))

</td>
<td>

```json
{
    "prefix": "on",
    "noUnnecessaryBraces": true
}
```

</td>
<td>
<p align="justify">
allows to configure prefix of event declaration. Can also be configured to comment out unnecessary braces usage e.g. <strong>@click="onClick()"`</strong>.
</p>
</td>
</tr>

<!-- *************************** -->

<tr>
<td>

[SelfClosingTag](../src/rules/v1/vue/SelfClosingTag.js)

</td>
<td>❎</td>
<td>
<p align="justify">
comments out tags that are not self-closed but have no content.
</p>
</td>
</tr>

<!-- *************************** -->

</table>
