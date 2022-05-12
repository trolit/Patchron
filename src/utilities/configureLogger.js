const {
    settings: { isStoringLogsEnabled }
} = require('../config');
const setGlobalVariable = require('../helpers/setGlobalVariable');
const setupLogBasePathJob = require('../utilities/setupLogBasePathJob');

module.exports = (app) => {
    if (isStoringLogsEnabled) {
        setupLogBasePathJob();
    } else {
        setGlobalVariable('log', app.log);
    }
};
