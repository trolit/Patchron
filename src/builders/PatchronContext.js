const EventEmitter = require('events');

const {
    nodeEnvironment,
    settings: { isStoringLogsEnabled }
} = require('src/config');
const EventLog = require('src/utilities/EventLog');
const updateLogPathJob = require('src/utilities/updateLogPathJob');

/**
 * Class wrapping Probot's features and Patchron's logic.
 */
class PatchronContextBuilder {
    /**
     * @param {ProbotApp} app
     */
    constructor(app) {
        this.log = null;
        this.repo = null;
        this.pullRequest = {
            owner: null,
            id: null,
            context: null
        };

        if (isStoringLogsEnabled && nodeEnvironment !== 'test') {
            const eventEmitter = new EventEmitter();

            eventEmitter.on('path-updated', (updatedLog) => {
                this.log = new EventLog(updatedLog);
            });

            updateLogPathJob(eventEmitter);
        } else {
            this.log = new EventLog(app.log);
        }

        return this;
    }

    /**
     * @param {ProbotContext} context
     */
    initializePullRequestData(context) {
        const payload = context.payload;

        const repo = context.repo();

        this.log.setPullNumber(payload.number);

        const { login: owner } = payload.sender;

        this.pullRequest = {
            owner,
            context,
            id: payload.number
        };

        this.repo = repo;
    }
}

module.exports = PatchronContextBuilder;
