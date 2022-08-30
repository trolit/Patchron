<img src="./.github/images/banner.png" alt="banner image">

# 🐶 Patchron

<p>

<img src="https://img.shields.io/github/package-json/v/trolit/Patchron?color=ffa06b" alt="version badge"/>
<a href="./.github/AVAILABLE_RULES.md" target="_blank">
    <img src="https://img.shields.io/badge/--%3E%20List%20of%20available%20rules%20%3C---65f9a0" alt="badge with anchor to AVAILABLE_RULES.md"/>
</a> <a href="./.github/DEV_OVERVIEW.md" target="_blank">
    <img src="https://img.shields.io/badge/--%3E%20For%20Developer%20%3C---a175e8" alt="badge with anchor to DEV_OVERVIEW.md "/>
</a>
</p>

<p align="justify">
GitHub bot 🤖 that performs "early" pull request code review.
</p>

-   versioned rules
-   built with [Probot](https://probot.github.io/docs/)
-   easy to configure and [expand](./.github/DEV_OVERVIEW.md)
-   includes tests (Jest) and type definitions (jsdoc)
-   wrapped with [own context](./src/builders/PatchronContext.js) to improve logging and accessing Probot's context

Disclaimer

> review is based upon patches which contain limited number of information. Due to that, some comments might be unrelevant. Despite of that, it comes to clicking resolve button while at the same time reviewers don't have to focus on simple things.

## 1. Setup

<details>
    <summary>
        Node.js
    </summary>

1. Clone repository.
2. Install dependencies.

```sh
npm install
```

3. Run the bot.

```sh
npm start
```

4. Follow further instructions from terminal to finish setup.

</details>

<details>
    <summary>
        Docker
    </summary>

1. Pull image from GHCR or build your own.

```sh
docker pull ghcr.io/trolit/patchron:latest
```

```sh
docker build -t patchron .
```

2. Obtain `APP_ID` and `PRIVATE_KEY`.

Install app via marketplace https://github.com/apps/patchron and configure repository access. Afterwards visit app https://github.com/settings/installations, note down `APP_ID` and generate `PRIVATE_KEY`.

3. Create running container from image (APP_ID and PRIVATE_KEY are mandatory)

```sh
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> patchron

more options:
-e SENDERS=<usernames-separated-by-comma>
-e MAX_COMMENTS_PER_REVIEW=<number>
```

</details>

<details>
    <summary>
        GitHub Actions
    </summary>

Depending on how do you want to handle authentication in workflow (and at the same time decide upon review comments author) you can:

### Use GitHub Token or PAT

You can use `GitHub token` that is generated automatically on event (comments will be associated with `github-actions` bot) or `personal access token` to associate review with e.g. your own bot account. Use following snippet to add workflow to your repository and adjust it to your needs.

```yml
name: Perform first PR review (GITHUB TOKEN)

on:
    pull_request:
        types:
            - opened

jobs:
    reviewOpenedPull:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
              with:
                  repository: 'trolit/Patchron'
                  ref: 'master'

            - run: npm ci --only=production

            - run: npm start
              # options: https://github.com/trolit/Patchron#2-configuration
              env:
                  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # or secrets.PAT
                  # when 'github' is assigned, attempts to read variables directly from workflow
                  NODE_ENV: 'github'
```

### Use app installation token

⚠️ Note: Snippet uses <a href="https://github.com/navikt/github-app-token-generator">@navikt/github-app-token-generator</a> to generate app installation token. You can provide different solution (or your own). At this moment <a href="https://github.com/probot/adapter-github-actions">probot/adapter-github-actions</a> does not support to generate app installation token by app id and private key.

1.  Install app via marketplace https://github.com/apps/patchron
2.  Configure repository access (repository that you want to be reviewed should be accessible by app).
3.  Generate `PRIVATE_KEY`
4.  Add `APP_ID` and `PRIVATE_KEY` secrets to repository
5.  Use following snippet to add workflow in your repository.

```yml
name: Perform first PR review (APP INSTALLATION TOKEN)

on:
    pull_request:
        types:
            - opened

jobs:
    reviewOpenedPull:
        runs-on: ubuntu-latest
        steps:
            - uses: navikt/github-app-token-generator@v1
              id: get-token
              with:
                  private-key: ${{ secrets.PRIVATE_KEY }}
                  app-id: ${{ secrets.APP_ID }}

            - uses: actions/checkout@v3
              with:
                  repository: 'trolit/Patchron'
                  ref: 'master'

            - run: npm ci --only=production

            - run: npm start
              # options: https://github.com/trolit/Patchron#2-configuration
              env:
                  GITHUB_TOKEN: ${{ steps.get-token.outputs.token }}
                  # when 'github' is assigned, attempts to read variables directly from workflow
                  NODE_ENV: 'github'
```

</details>

<details>
<summary>
How to configure own rules 🤔❔
</summary>

Rules config file is expected to be expressed as `.json` in specific structure to unify app behaviour between all available ways of serving it. Repository default configuration can be found [here](./src/config/rules.json). It uses following format:

```json
{
    "pull": [],
    "files": {
        "js": [
            { "rulename": "v1/common/MarkedComments", ... }
        ],
        "vue": [],
        "cs": []
    }
}
```

When app catches files from pull request event, it takes each filename (e.g. `src/helpers/doSomething.js`) and attempts to get related rules from `files` object (`rules.files['js']`). Pull rules are separated from that behaviour as they do not test files but pull request itself.

There might be a case where repository is used to hold e.g. both `client` and server `instances` and you would like to separate `client` rules from `server` because for instance server is in `commonjs` type and `client` in `module`. Then you could do the following:

```json
{
    "pull": [],
    "files": [
        "server/*": {
            "js": [
                { rule1 }
            ]
        },
        "client/*": {
            "js": [
                { rule1 }
            ],
            "vue": [
                { rule1 }
            ]
        }
    ]
}
```

-   It is required to provide full relative path.
-   End relative paths with asterisks (e.g. `server/*`) to match all files which location starts with `server/`.

-   `server/*`

    -   `server/doSomething.js` (matched)
    -   `server/helpers/chart/saveLegendItems.js` (matched)

-   `server`
    -   `server/doSomething.js` (matched)
    -   `server/helpers/chart/saveLegendItems.js` (not matched)

</details>

## 2. Configuration

| Property                                    | Type (default)               | Description                                                                                                                                                                                                                                  |
| :------------------------------------------ | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                                  | String (` `)                 | specifies environment in which app is running. For GitHub actions use `github`, for testing purposes `test` and for self hosted `production`. Post comments, summary, approve actions are limited to `github` and `production` environments. |
| `RULES_CONFIGURATION_PATH`                  | String (`src/config/rules`)  | Path to rules configuration file stored in project. Used when `RULES_CONFIGURATION_URL` is not provided.                                                                                                                                     |
| `RULES_CONFIGURATION_URL`                   | String (` `)                 | When provided, attempts to fetch rules configuration from given URL. URL should point to `.json` file ([example structure](./src/config/rules.json)).                                                                                        |
| `IS_GET_FILES_REQUEST_PAGINATED`            | boolean (`false`)            | Controls files fetching strategy. Unpaginated response includes a maximum of 3000 files which is sufficient in 99.9999999999% of cases.                                                                                                      |
| `DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS` | Number (`3`)                 | After pull request review is done, delays time between each comment POST request to not overload GitHub API. Creating content too quickly may result in secondary rate limiting.                                                             |
| `IS_OWNER_ASSIGNING_ENABLED`                | boolean (`true`)             | When true, PR owner will be automatically assigned on issueing pull request.                                                                                                                                                                 |
| `IS_REVIEW_SUMMARY_ENABLED`                 | boolean (`false`)            | When true, at the end of the PR review, app will post summary that contains various information e.g. total comments that were successfully posted.                                                                                           |
| `IS_STORING_LOGS_ENABLED`                   | boolean (`false`)            | When true, logs are also stored physically in `.logs` directory. Log files are named in following way: `YYYY-MM-DD`.                                                                                                                         |
| `MAX_COMMENTS_PER_REVIEW`                   | Number (`25`)                | Limits number of comments that can be posted in single review under single pull request.                                                                                                                                                     |
| `SENDERS`                                   | Array&lt;`string`&gt; (`[]`) | Allows to limit pull requests reviews to certain users. Pass GitHub usernames.                                                                                                                                                               |
| `APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS`     | boolean (`true`)             | When true, approves pull request on empty review comments.                                                                                                                                                                                   |

## 3. Useful links

-   [Probot docs](https://probot.github.io/docs/)
-   [Octokit Rest API](https://octokit.github.io/rest.js)
-   [Deployments API example](https://developer.github.com/v3/repos/deployments/)
-   [Pino (logger)](https://getpino.io/#/)
-   [GitHub API - best practices](https://docs.github.com/en/rest/guides/best-practices-for-integrators)
-   [GitHub API - rate limits](https://docs.github.com/en/developers/apps/building-github-apps/rate-limits-for-github-apps)
-   [GitHub API - pulls](https://docs.github.com/en/rest/reference/pulls)
-   [Default picture](https://pixabay.com/vectors/dog-pet-hound-black-eye-animal-151123/)

## 4. Name origin

Name simply comes from merging two words: Patch and [Patron](<https://en.wikipedia.org/wiki/Patron_(dog)>) 🐶
