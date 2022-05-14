const configureLogger = require('../utilities/configureLogger');

/** TBD */
class PepegaContextBuilder {
    constructor(app) {
        configureLogger(app, this);

        return this;
    }

    initPullRequestData(pullRequestContext) {
        const payload = pullRequestContext.payload;

        const repo = pullRequestContext.repo();

        repo.pull_number = payload.number;

        this.pullRequest = {
            ...repo,
            id: payload.number,
            context: pullRequestContext
        };
    }
}

module.exports = PepegaContextBuilder;
