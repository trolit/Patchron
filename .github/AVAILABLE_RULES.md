# Available rules

Rules are grouped by category 📐. Common rules are ones that potentionally could be used in more than single extension (at least two). If you want to find out more information about certain rule, please check it's `jsdoc` description.

Keep in mind that patches make it impossible to determine whether part of analysed code is source code or pure string. For instance, `ComparisionOperatorLevel` rule would comment out `==` if it appeared in `string` or HTML. It's annoying disadvantage but in my opinion 1) it's not often case to use such things in strings and 2) it's always faster to click `resolve button` on unrelated comment than having to pay big attention to each line.

## 📐Common

| Rule 📌                                                                     | Description 📋                                                                                                                                                                                                                                                                                                           |
| :-------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ComparisionOperatorLevel](../src/rules/v1/common/ComparisionOperatorLevel.js) | tests equality/inequality level. Has three levels. Due to fact that PHP also includes strict/weak equality/inequality feature, it's in common category.                                                                                                                                                                  |
| [FixedLoopLengthCondition](../src/rules/v1/common/FixedLoopLengthCondition.js) | intended to check `for/while/do..while` loops and comment out `.length` reference in condition statement.                                                                                                                                                                                                                |
| [KeywordsOrderedByLength](../src/rules/v1/common/KeywordsOrderedByLength.js)   | tests configured keywords order. If there is a need in ordering packages and other imports separately try to define two separate keywords. The key thing is to find some difference that will allow to determine which import is package and which component.                                                            |
| [LineBreakBeforeReturn](../src/rules/v1/common/LineBreakBeforeReturn.js)       | checks whether `return` statements should be preceded with line-break.                                                                                                                                                                                                                                                   |
| [MarkedComments](../src/rules/v1/common/MarkedComments.js)                     | reviews whether `//` or `/* */` comments start with at least one of the predefined prefixes.                                                                                                                                                                                                                             |
| [PositionedKeywords](../src/rules/v1/common/PositionedKeywords.js)             | tests configured keywords position. Position can be BOF (beginning of file) or custom. If default position is not found and keyword has `enforced` flag set to true, first matched occurence of keyword is used as position. It's highly recommended for e.g. `import` as in 99% cases patches won't contain first line. |
| [PredefinedFilenames](../src/rules/v1/common/PredefinedFilenames.js)           | checks names of pull requested files based on configured restrictions. For instance files from `backend/controllers/*` could be restricted with `[a-z].*Controller.js` pattern.                                                                                                                                          |
| [SingleLineBlockPattern](../src/rules/v1/common/SingleLineBlockPattern.js)     | tests single line blocks curly braces presence depending on configuration.                                                                                                                                                                                                                                               |

## 📐HTML

| Rule 📌                                               | Description 📋                                                                       |
| :---------------------------------------------------- | :----------------------------------------------------------------------------------- |
| [MarkedComments](../src/rules/v1/html/MarkedComments.js) | test whether `<!-- -->` comments start with at least one of the predefined prefixes. |

## 📐JavaScript

| Rule 📌                                                                 | Description 📋                                                                                  |
| :---------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| [AsynchronousPattern](../src/rules/v1/js/AsynchronousPattern.js)           | Tests whether `await` or `.then` pattern is used                                                |
| [ImplicitIndexFileImport](../src/rules/v1/js/ImplicitIndexFileImport.js)   | ensures that `import/require` statements that target `index` file are explicit.                 |
| [ImportWithoutExtension](../src/rules/v1/js/ImportWithoutExtension.js)     | checks whether `import/require` statements do not end with extension.                           |
| [IndividualMethodImport](../src/rules/v1/js/IndividualMethodImport.js)     | allows to define packages which methods should be `imported/required` one by one e.g. `lodash`. |
| [SimpleComparision](../src/rules/v1/js/SimpleComparision.js)               | allows to define simple patterns that should have simplified form e.g. `test > -1 -> ~test`.    |
| [SimplePropertyAssignment](../src/rules/v1/js/SimplePropertyAssignment.js) | looks after value assignment to property of the same name e.g. `test1: test1`.                  |

## 📐Pull

| Rule 📌                                               | Description 📋                                                                                                      |
| :---------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| [StrictWorkflow](../src/rules/v1/pull/StrictWorkflow.js) | checks workflow of issued pull request and prefix of the branch. Can be configured to abort further (files) review. |

## 📐Vue

| Rule 📌                                                              | Description 📋                                                                                  |
| :------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| [NormalizedEventHandler](../src/rules/v1/vue/NormalizedEventHandler.js) | allows to configure prefix of event declaration. Can also comment out unnecessary braces usage. |
| [SelfClosingTag](../src/rules/v1/vue/SelfClosingTag.js)                 | comments out tags that are not self-closed but have no content.                                 |
