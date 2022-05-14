const EventEmitter = require('events');

const {
    settings: { isStoringLogsEnabled }
} = require('../config');
const EventLog = require('./EventLog');
const updateLogPathJob = require('./updateLogPathJob');

module.exports = (app, pepegaContext) => {
    const eventEmitter = new EventEmitter();

    eventEmitter.on('path-updated', (updatedLog) => {
        pepegaContext.log = new EventLog(updatedLog);
    });

    if (isStoringLogsEnabled) {
        updateLogPathJob(eventEmitter);
    } else {
        pepegaContext.log = new EventLog(app.log);
    }
};
