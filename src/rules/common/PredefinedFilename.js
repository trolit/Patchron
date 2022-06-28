const BaseRule = require('src/rules/Base');

class PredefinedFilenameRule extends BaseRule {
    /**
     * @param {PatchronContext} patchronContext
     * @param {object} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);
    }

    invoke() {
        const reviewComments = [];

        return reviewComments;
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `TBA`;
    }
}

module.exports = PredefinedFilenameRule;
