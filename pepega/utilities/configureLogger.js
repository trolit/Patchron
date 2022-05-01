const {
    settings: { isStoringLogsEnabled }
} = require('../config');
const setupLogBasePathJob = require('../utilities/setupLogBasePathJob');

module.exports = (app) => {
    if (isStoringLogsEnabled) {
        setupLogBasePathJob();
    } else {
        global.log = app.log;
    }
};
