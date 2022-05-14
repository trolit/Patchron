const EventEmitter = require('events');

const {
    settings: { isStoringLogsEnabled }
} = require('../config');
const updateLogPathJob = require('./updateLogPathJob');

module.exports = (app, pepegaContext) => {
    const eventEmitter = new EventEmitter();

    if (isStoringLogsEnabled) {
        updateLogPathJob(eventEmitter);

        eventEmitter.on('path-updated', (updatedLog) => {
            pepegaContext.log = updatedLog;
        });
    } else {
        pepegaContext.log = app.log;
    }
};
