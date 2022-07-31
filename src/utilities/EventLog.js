class EventLog {
    /** Constructs `Patchron` log service */
    constructor(log) {
        this.log = log;
    }

    /**
     * @param {string} filename
     * @param {string} message
     * @param {object} [file]
     * @param {object} [additionalData]
     */
    error(filename, message, file = null, additionalData = null) {
        if (!this.log) {
            return;
        }

        const logData = file
            ? {
                  causedBy: file?.filename,
                  contentsUrl: file?.contents_url
              }
            : {};

        this.log.error(
            {
                ...logData,
                triggeredAt: filename,
                ...additionalData
            },
            `${filename}: ${message}`
        );
    }

    /**
     * use to log any useful information (e.g. skipped 20 comments due to limit per review)
     *
     * @param {string} filename
     * @param {string} message
     * @param {object} [additionalData]
     */
    information(filename, message, additionalData = null) {
        if (!this.log) {
            return;
        }

        this.log.info(
            {
                triggeredAt: filename,
                ...additionalData
            },
            `${filename}: ${message}`
        );
    }

    /**
     * use to log any unexpected behaviour (e.g. wrong rule config, insufficient data)
     *
     * @param {string} filename
     * @param {string} message
     * @param {object} file
     * @param {object} [additionalData]
     */
    warning(filename, message, file = null, additionalData = null) {
        if (!this.log) {
            return;
        }

        const logData = file
            ? {
                  causedBy: file?.filename,
                  contentsUrl: file?.contents_url
              }
            : {};

        this.log.warn(
            {
                ...logData,
                triggeredAt: filename,
                ...additionalData
            },
            `${filename}: ${message}`
        );
    }

    /**
     * use to log errors that are coming from GitHub API responses\
     *
     * @param {object} error
     * @param {object} [additionalData]
     */
    fatal(error, additionalData = null) {
        if (!this.log) {
            return;
        }

        this.log.fatal({
            error,
            ...additionalData
        });
    }
}

module.exports = EventLog;
