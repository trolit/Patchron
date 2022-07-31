<img src="https://github.com/trolit/Patchron/blob/master/.github/picture.jpg" alt="Patchron image" height="200"/>

# 🐶 Patchron

<p align="justify">
inteded to support in maintaining simple project conventions among project members and speeding up further code review done by humans by performing early pull request review once issued.
</p>

### Disclaimers

-   review is based on patches which contain limited number of information. Due to that you may find some comments unrelevant to the situation but still those should be "rare cases".

-   review won't work on minified files unless they will be "beautified" first.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start

# Finish Probot configuration
```

## Docker

```sh
# 1. Build container
docker build -t patchron .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> patchron
```

## Settings

| Property                               | Type (default)       | Description                                                                                                                             |
| :------------------------------------- | :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `isGetFilesRequestPaginated`           | boolean (`false`)    | Controls files fetching strategy. Unpaginated response includes a maximum of 3000 files which is sufficient in 99.9999999999% of cases. |
| `delayBetweenCommentRequestsInSeconds` | Number (`3`)         | After review is done, delays time between each comment request to not overload API.                                                     |
| `isOwnerAssigningEnabled`              | boolean (`true`)     | When true, PR owner will be automatically assigned on issueing pull request.                                                            |
| `isReviewSummaryEnabled`               | boolean (`false`)    | When true, at the end of the PR review, Patchron posts summary that contains various information e.g. how many comments were posted.    |
| `isStoringLogsEnabled`                 | boolean (`true`)     | When true, logs are also stored physically in `/.logs` directory.                                                                       |
| `maxCommentsPerReview`                 | Number (`25`)        | Limits number of comments that can be posted in single review under single PR.                                                          |
| `senders`                              | Array<string> (`[]`) | Allows to limit pull requests reviews to certain users. Pass GitHub usernames.                                                          |

## Short dev overview

Patch contains latest changes done to particular file. Here is example of how received data looks like:

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

<details>
<summary>Things to note</summary>

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

In almost all rules, received data is organized via `setupData` to easier further code analysis. Content is split by newline and each row contains default information mentioned below:

```ts
{
    index: number,
    indentation: number,
    content: string,
    trimmedContent: string
}
```

-   Indentation is great option to better identify relation between particular parts of code if needed.
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

For more details on how those objects can be arranged, refer to [general type definitions](https://github.com/trolit/Patchron/blob/master/src/config/type-definitions/general.js).

## Links

-   [Octokit Rest API](https://octokit.github.io/rest.js)
-   [Deployments API example](https://developer.github.com/v3/repos/deployments/)
-   [Probot docs](https://probot.github.io/docs/)
-   [GitHub API - best practices](https://docs.github.com/en/rest/guides/best-practices-for-integrators)
-   [GitHub API - rate limits](https://docs.github.com/en/developers/apps/building-github-apps/rate-limits-for-github-apps)
-   [GitHub API - pulls](https://docs.github.com/en/rest/reference/pulls)
-   [Default picture](https://pixabay.com/vectors/dog-pet-hound-black-eye-animal-151123/)

## Name origin

Name simply comes from merging two words: Patch and [Patron](<https://en.wikipedia.org/wiki/Patron_(dog)>) 🐶
