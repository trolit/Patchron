<img src="https://github.com/trolit/Pepega/blob/master/picture.png" alt="Bot default avatar" height="100"/>

# Detective Pepega

> A GitHub App built with [Probot](https://github.com/probot/probot) which is meant to help in maintaining development conventions by performing early pull request code review. CR is based on patches that contain limited number of information from modified files. Due to this, some review comments might not be accurate, but still, those are edge cases (e.g. patch which is fragment of multi-line string or differentiating interpolated code from raw string) which can be ignored when reviewed by PR owner.

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
docker build -t pepega .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> pepega
```

## Settings

| Property | Type | Description |
| :--- | :--- | :--- |
| isGetFilesRequestPaginated | boolean | test |
| delayBetweenCommentRequestsInSeconds | Number | test |
| isOwnerAssigningEnabled | boolean | test |
| isReviewSummaryEnabled | boolean | test |
| isStoringLogsEnabled | boolean | test |
| maxCommentsPerReview | Number | test |
| senders | Array<string> | test |

## Contributing

If you have suggestions for how pepega could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## Links

-   [Deployments API example](https://developer.github.com/v3/repos/deployments/)
-   [Probot docs](https://probot.github.io/docs/)
-   [GitHub API - best practices](https://docs.github.com/en/rest/guides/best-practices-for-integrators)
-   [GitHub API - rate limits](https://docs.github.com/en/developers/apps/building-github-apps/rate-limits-for-github-apps)
-   [GitHub API - pulls](https://docs.github.com/en/rest/reference/pulls)
-   [Profile picture](https://pixabay.com/vectors/frog-tongue-animal-green-cartoon-159003/)

## License

[ISC](LICENSE) © 2022 p4w31 !d21k0w5k1
