const EventEmitter = require('events');

const {
    settings: { isStoringLogsEnabled }
} = require('../config');
const updateLogPathJob = require('./updateLogPathJob');

module.exports = (app, pepegaContext) => {
    const eventEmitter = new EventEmitter();

    eventEmitter.on('path-updated', (updatedLog) => {
        pepegaContext.log = updatedLog;
    });

    if (isStoringLogsEnabled) {
        updateLogPathJob(eventEmitter);
    } else {
        pepegaContext.log = app.log;
    }
};
