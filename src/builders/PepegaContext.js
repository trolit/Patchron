const {
    settings: { isStoringLogsEnabled }
} = require('../config');
const EventEmitter = require('events');
const EventLog = require('./EventLog');
const updateLogPathJob = require('./updateLogPathJob');

/**
 * Class wrapping Probot's features and Pepega's logic.
 */
class PepegaContextBuilder {
    constructor(app) {
        const eventEmitter = new EventEmitter();

        eventEmitter.on('path-updated', (updatedLog) => {
            this.log = new EventLog(updatedLog);
        });

        if (isStoringLogsEnabled) {
            updateLogPathJob(eventEmitter);
        } else {
            this.log = new EventLog(app.log);
        }

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

/**
 * Class wrapping Probot's features and Pepega's logic.
 */
module.exports = PepegaContextBuilder;
