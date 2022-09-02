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
GitHub bot 🤖 that performs initial pull request code review. It is intended to faster further code reviews, not substitute human ones 😎
</p>

-   versioned rules
-   built with [Probot](https://probot.github.io/docs/)
-   easy to configure and [expand](./.github/DEV_OVERVIEW.md)
-   includes tests (Jest) and type definitions (jsdoc)
-   wrapped with [own context](./src/builders/PatchronContext.js) to improve logging and accessing Probot's context

Disclaimer

> review is based upon patches (to not overload GitHub API) which contain limited number of information. Due to that, some comments might be unrelevant. Despite of that, it comes to clicking resolve button while at the same time reviewers don't have to focus on simple things.

## 1. Setup

<details>
    <summary>
        with Node.js
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
        with Docker
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
        with GitHub Actions
    </summary>

### Use GitHub Token or PAT

You can use `GitHub token` that is generated automatically on event (comments will be associated with `github-actions` bot) or `personal access token` to associate review with e.g. your own bot account. In that case you only need to add following snippet to repository workflow and adjust it to your needs.

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

<br/>

<details>
<summary>
How to arrange own rules 🤔❔
</summary>

Rules config file is expected to be expressed as `.json` with specific structure to unify app behaviour between all available ways of serving it. It should have `pull` array and `files` object. Pull rules are intended to verify pull request data (not changes in files) and that's why it has separated section. You can manage configuration in two ways:

### via extension

```json
{
    "pull": [],
    "files": {
        "js": [],
        "vue": [],
        "cs": []
    }
}
```

It's used in repository as default configuration [here](./src/config/rules.json). When app fetches files from pull request event, it takes each filename and attempts to get related rules from `files` object by file extension. If e.g. bot receives `src/helpers/doSomething.js` it will attempt to get rules from `rules.files['js']`.

### via relative paths

There might be a case where single repository is used to store more app parts (e.g. `client` and `server`) and you would like to separate `client` rules from `server` (because for example `server` is in `commonjs` type and `client` in `module`). To solve it, you can prepare [structure](./.github/examples/rulesByRelativePaths.json) that groups rules by relative paths:

```json
{
    "pull": [],
    "files": [
        "server/*": {
            "js": [
                { }
            ]
        },
        "client/*": {
            "js": [
                { }
            ],
            "vue": [
                { }
            ]
        }
    ]
}
```

⚠️ End relative paths with asterisks (e.g. `server/*`) if you want to match files that are stored under `server/` regardless of the nesting level.

-   `server/*`

    -   `server/doSomething.js` (matched)
    -   `server/helpers/chart/saveLegendItems.js` (matched)

-   `server`
    -   `server/doSomething.js` (matched)
    -   `server/helpers/chart/saveLegendItems.js` (not matched)

</details>

## 2. Configuration

| Property                                    | Type (default)              | Description                                                                                                                                                                                                                                             |
| :------------------------------------------ | :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NODE_ENV`                                  | String (` `)                | specifies environment in which app is running. For GitHub actions use `github`, for testing purposes `test` and for self hosted app `production`. GitHub POST comments, summary, approve actions are limited to `github` and `production` environments. |
| `RULES_CONFIGURATION_PATH`                  | String (`src/config/rules`) | Path to rules configuration file stored in project. Used when `RULES_CONFIGURATION_URL` is not provided.                                                                                                                                                |
| `RULES_CONFIGURATION_URL`                   | String (` `)                | When provided, attempts to fetch rules configuration from given URL. URL should point to `.json` file ([example structure](./src/config/rules.json)).                                                                                                   |
| `IS_GET_FILES_REQUEST_PAGINATED`            | boolean (`false`)           | Controls files fetching strategy. Unpaginated response includes a maximum of 3000 files which is sufficient in 99.9999999999% of cases.                                                                                                                 |
| `DELAY_BETWEEN_COMMENT_REQUESTS_IN_SECONDS` | Number (`3`)                | After pull request review is done, delays time between each comment POST request to not overload GitHub API. Creating content too quickly may result in secondary rate limiting.                                                                        |
| `IS_OWNER_ASSIGNING_ENABLED`                | boolean (`true`)            | When true, PR owner will be automatically assigned on issueing pull request.                                                                                                                                                                            |
| `IS_REVIEW_SUMMARY_ENABLED`                 | boolean (`false`)           | When true, at the end of the PR review, app will post summary that contains various information e.g. total comments that were successfully posted.                                                                                                      |
| `IS_STORING_LOGS_ENABLED`                   | boolean (`false`)           | When true, logs are also stored physically in `.logs` directory. Log files are named in following format: `YYYY-MM-DD`.                                                                                                                                 |
| `MAX_COMMENTS_PER_REVIEW`                   | Number (`25`)               | Limits number of comments that can be posted in single review under single pull request.                                                                                                                                                                |
| `SENDERS`                                   | String (` `)                | Allows to limit pull requests reviews to certain users. Pass string with usernames separated by comma e.g. `'test1, test2, test3'`                                                                                                                      |
| `APPROVE_PULL_ON_EMPTY_REVIEW_COMMENTS`     | boolean (`true`)            | When true, approves pull request on empty review comments.                                                                                                                                                                                              |

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
