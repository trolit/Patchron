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
        /**
         * reference to logger wrapped within `EventLog`
         * @type {import('../utilities/EventLog')}
         * @public
         */
        this.log = null;

        /**
         * stores properties received via Probot's `context.repo()`
         * @type {object}
         * @public
         */
        this.repo = null;

        this.pullRequest = {
            /**
             * hooked pull request owner login
             * @type {string}
             * @public
             */
            owner: null,

            /**
             * hooked pull request id
             * @type {number}
             * @public
             */
            id: null,

            /**
             * reference to Probot's context
             * @type {import('probot').Context}
             * @public
             */
            context: null
        };

        if (isStoringLogsEnabled) {
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
     * @param {import('probot').Context} context
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

module.exports = PepegaContextBuilder;
