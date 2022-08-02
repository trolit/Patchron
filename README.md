<img src="./.github/images/banner.png" alt="banner image">

# 🐶 Patchron

<p>
<a href="./.github/AVAILABLE_RULES.md" target="_blank">
    <img src="https://img.shields.io/badge/List of available rules-65f9a0" alt="shields.io - button badge"/>
</a> <a href="./.github/DEV_OVERVIEW.md" target="_blank">
    <img src="https://img.shields.io/badge/For Developer-a175e8" alt="shields.io - button badge"/>
</a>
</p>

<p align="justify">
app that supports team in maintaining simple project conventions and speeds up further code review excluding simple cases once PR is issued. 
</p>

#### Disclaimers ❗

-   review is based upon **patches** which contain limited number of information. Due to that, some comments might be unrelevant to the situation. Despite of that, it comes to clicking resolve button while at the same time reviewers don't have to focus on simple things.

-   review won't work on minified files. Beautifying patches is not an option due to possibility of receiving only part of code.

-   app was tested on basic Prettier configuration ([tabWidth](https://prettier.io/docs/en/options.html#tab-width): 4, [printWidth](https://prettier.io/docs/en/options.html#print-width): 80)

## 1. Setup

```sh
# 0. Fork or Download

# 1. Install dependencies
npm install

# 2. Configure app (config/index.js) & rules

# 3. Run the bot
npm start

# 4. Finish configuration (APP_ID and PRIVATE_KEY in .env)
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

## 3. Settings

| Property                               | Type (default)               | Description                                                                                                                             |
| :------------------------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `isGetFilesRequestPaginated`           | boolean (`false`)            | Controls files fetching strategy. Unpaginated response includes a maximum of 3000 files which is sufficient in 99.9999999999% of cases. |
| `delayBetweenCommentRequestsInSeconds` | Number (`3`)                 | After review is done, delays time between each comment request to not overload API.                                                     |
| `isOwnerAssigningEnabled`              | boolean (`true`)             | When true, PR owner will be automatically assigned on issueing pull request.                                                            |
| `isReviewSummaryEnabled`               | boolean (`true`)             | When true, at the end of the PR review, Patchron posts summary that contains various information e.g. how many comments were posted.    |
| `isStoringLogsEnabled`                 | boolean (`true`)             | When true, logs are also stored physically in `/.logs` directory.                                                                       |
| `maxCommentsPerReview`                 | Number (`25`)                | Limits number of comments that can be posted in single review under single PR.                                                          |
| `senders`                              | Array&lt;`string`&gt; (`[]`) | Allows to limit pull requests reviews to certain users. Pass GitHub usernames.                                                          |

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
