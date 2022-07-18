<img src="https://github.com/trolit/Patchron/blob/master/picture.jpg" alt="Patchron image" height="200"/>

# Patchron

> A GitHub App built with [Probot](https://github.com/probot/probot) that implements set of rules to perform early pull request review and comment out cases that do not meet configuration. **Please note that review is based on patches which contain limited number of information**. Due to that you may find some review comments to not be relevant to the situation but still `Patchron` can be used to maintain conventions and speed up further code reviews done by members by commenting out simple cases.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t patchron .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> patchron
```

## Settings

| Property                               | Type (default)       | Description                                                                                                                   |
| :------------------------------------- | :------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `isGetFilesRequestPaginated`           | boolean (`false`)    | Controls how files are fetched. Unpaginated response includes a maximum of 3000 files which is sufficient in 99.9999999999% of cases. |
| `delayBetweenCommentRequestsInSeconds` | Number (`3`)         | After review is done, delays time between each comment request to not overload API.                                           |
| `isOwnerAssigningEnabled`              | boolean (`true`)     | When true, PR owner will be automatically assigned once pull request will be issued.                                          |
| `isReviewSummaryEnabled`               | boolean (`false`)    | When true, at the end of the PR review summary is posted that contains various information e.g. how many comments were posts. |
| `isStoringLogsEnabled`                 | boolean (`true`)     | When true, stores logs physically in `/.logs` directory.                                                                      |
| `maxCommentsPerReview`                 | Number (`25`)        | Limit number of comments that can be posted in single review under single PR.                                                 |
| `senders`                              | Array<string> (`[]`) | Allows to limit pull requests reviews to certain users. Pass GitHub usernames.                                                |

## Patch overview (dev)

Patch contains latest changes done to particular file. Here is example of how it looks like:

```js
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

## Links

-   [Deployments API example](https://developer.github.com/v3/repos/deployments/)
-   [Probot docs](https://probot.github.io/docs/)
-   [GitHub API - best practices](https://docs.github.com/en/rest/guides/best-practices-for-integrators)
-   [GitHub API - rate limits](https://docs.github.com/en/developers/apps/building-github-apps/rate-limits-for-github-apps)
-   [GitHub API - pulls](https://docs.github.com/en/rest/reference/pulls)
-   [Default picture](https://pixabay.com/vectors/dog-pet-hound-black-eye-animal-151123/)

## License

[ISC](LICENSE) © 2022 trolit
