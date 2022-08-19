<img src="./.github/images/banner.png" alt="banner image">

# 🐶 Patchron

<p>
<img src="https://img.shields.io/badge/1.1.0-ffa06b" alt="version badge"/>
<a href="./.github/AVAILABLE_RULES.md" target="_blank">
    <img src="https://img.shields.io/badge/--%3E%20List%20of%20available%20rules%20%3C---65f9a0" alt="badge with anchor to AVAILABLE_RULES.md"/>
</a> <a href="./.github/DEV_OVERVIEW.md" target="_blank">
    <img src="https://img.shields.io/badge/--%3E%20For%20Developer%20%3C---a175e8" alt="badge with anchor to DEV_OVERVIEW.md "/>
</a>
</p>

<p align="justify">
GitHub bot that performs early pull request code review once it is issued.
</p>

-   built with Probot framework
-   easy to configure and expand
-   with tests and type definitions
-   wrapped with own context to improve logging and accessing context

Disclaimers

> review is based upon patches which contain limited number of information. Due to that, some comments might be unrelevant to the situation. Despite of that, it comes to clicking resolve button while at the same time reviewers don't have to focus on simple things.

> app was tested on common Prettier configuration tabWidth: 4, printWidth: 80

## 1. Setup

```sh
# 0. Fork or Download

# 1. Install dependencies
npm install

# 2. Configure app

# 3. Run the bot
npm start

# 4. Follow further instructions to finish configuration (APP_ID and PRIVATE_KEY in .env)
https://github.com/settings/apps

```

## 2. Docker

```sh
# 1. Build container
docker build -t patchron .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> patchron

e.g. more options:
-e SENDERS=<usernames-separated-by-comma>
-e MAX_COMMENTS_PER_REVIEW=<number>
```

## 3. Configuration

| Property                               | Type (default)               | Description                                                                                                                                                                 |
| :------------------------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isGetFilesRequestPaginated`           | boolean (`false`)            | Controls files fetching strategy. Unpaginated response includes a maximum of 3000 files which is sufficient in 99.9999999999% of cases.                                     |
| `delayBetweenCommentRequestsInSeconds` | Number (`3`)                 | After review is done, delays time between each comment request to not overload API. Creating content too quickly using this endpoint may result in secondary rate limiting. |
| `isOwnerAssigningEnabled`              | boolean (`true`)             | When true, PR owner will be automatically assigned on issueing pull request.                                                                                                |
| `isReviewSummaryEnabled`               | boolean (`false`)            | When true, at the end of the PR review, Patchron posts summary that contains various information e.g. how many comments were posted.                                        |
| `isStoringLogsEnabled`                 | boolean (`true`)             | When true, logs are also stored physically in `/.logs` directory.                                                                                                           |
| `maxCommentsPerReview`                 | Number (`25`)                | Limits number of comments that can be posted in single review under single PR.                                                                                              |
| `senders`                              | Array&lt;`string`&gt; (`[]`) | Allows to limit pull requests reviews to certain users. Pass GitHub usernames.                                                                                              |
| `approvePullOnEmptyReviewComments`     | boolean (`true`)             | When true, approves pull request on empty review comments.                                                                                                                  |

| Property                   | Default                     | Description                                                                                                                                            |
| :------------------------- | :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                 | String (`default`)          | specifies environment in which app is running. Default points to `.env.default`, test to `.env.test` and any other to `.env` (except for empty value). |
| `RULES_CONFIGURATION_URL`  | String (` `)                | When provided, attempts to fetch rules configuration from given URL. URL should point to `.json` file ([example structure](./src/config/rules.json)).  |
| `RULES_CONFIGURATION_PATH` | String (`src/config/rules`) | Path to rules configuration file stored in the project. Used in testing environment and when `RULES_CONFIGURATION_URL` is not specified.               |

## 4. Links

-   [Octokit Rest API](https://octokit.github.io/rest.js)
-   [Deployments API example](https://developer.github.com/v3/repos/deployments/)
-   [Probot docs](https://probot.github.io/docs/)
-   [Pino (logger)](https://getpino.io/#/)
-   [GitHub API - best practices](https://docs.github.com/en/rest/guides/best-practices-for-integrators)
-   [GitHub API - rate limits](https://docs.github.com/en/developers/apps/building-github-apps/rate-limits-for-github-apps)
-   [GitHub API - pulls](https://docs.github.com/en/rest/reference/pulls)
-   [Default picture](https://pixabay.com/vectors/dog-pet-hound-black-eye-animal-151123/)

## 5. Name origin

Name simply comes from merging two words: Patch and [Patron](<https://en.wikipedia.org/wiki/Patron_(dog)>) 🐶
