# pepega

> A GitHub App built with [Probot](https://github.com/probot/probot) that TBA

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

- [Deployments API example](https://developer.github.com/v3/repos/deployments/)
- [Probot doc's](https://probot.github.io/docs/)
- [GitHub API - best practices](https://docs.github.com/en/rest/guides/best-practices-for-integrators)
- [GitHub API - rate limits](https://docs.github.com/en/developers/apps/building-github-apps/rate-limits-for-github-apps)
- [GitHub API - pulls](https://docs.github.com/en/rest/reference/pulls)

## License

[ISC](LICENSE) © 2022 p4w31 !d21k0w5k1
