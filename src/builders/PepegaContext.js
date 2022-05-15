const configureLogger = require('../utilities/configureLogger');

/** Class wrapping Probot's features and Pepega's logic. */
class PepegaContextBuilder {
    constructor(app) {
        configureLogger(app, this);

        return this;
    }

    initializePullRequestData(pullRequestContext) {
        const payload = pullRequestContext.payload;

        const repo = pullRequestContext.repo();

        this.log.setPullNumber(payload.number);

        const { login: owner } = payload.sender;

        this.pullRequest = {
            owner,
            id: payload.number,
            context: pullRequestContext
        };

        this.repo = repo;
    }
}

module.exports = PepegaContextBuilder;
