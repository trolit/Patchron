<img src="https://github.com/trolit/Pepega/blob/master/picture.png" alt="Bot default avatar" height="100"/>

# Detective Pepega

> A GitHub App built with [Probot](https://github.com/probot/probot) which is meant to help in maintaining development conventions by performing first PR code review and leaving suggestions before another member performs manual CR. It is based on pure patches received from opened pull requests. Therefore, some review comments might not be accurate, but still, those are edge cases (e.g. patch which is fragment of multi-line string or differentiating interpolated code from raw string).

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
