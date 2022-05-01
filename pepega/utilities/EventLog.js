/**
 * use to log errors that are coming from rules
 * @param {string} filename
 * @param {string} message
 * @param {object} [file]
 */
function logError(filename, message, file = null) {
    if (!log) {
        return;
    }

    const logData = file
        ? {
              cause: file?.filename,
              split_patch: file?.split_patch
          }
        : {};

    log.error({ triggeredAt: filename, ...logData }, `${filename}: ${message}`);
}

/**
 * use to log any useful information (e.g. skipped 20 comments due to limit per review)
 * @param {string} filename
 * @param {string} message
 */
function logInformation(filename, message) {
    if (!log) {
        return;
    }

    log.info({ triggeredAt: filename }, `${filename}: ${message}`);
}

/**
 * use to log any unexpected behaviour (e.g. wrong rule config)
 * @param {string} filename
 * @param {string} message
 */
function logWarning(filename, message) {
    if (!log) {
        return;
    }

    log.info({ triggeredAt: filename }, `${filename}: ${message}`);
}

/**
 * use to log errors that are coming from GitHub API responses
 * @param {string} filename
 * @param {string} message
 */
function logFatal(filename, message) {
    if (!log) {
        return;
    }

    log.fatal({ triggeredAt: filename }, `${filename}: ${message}`);
}

module.exports = {
    logError,
    logFatal,
    logWarning,
    logInformation
};
