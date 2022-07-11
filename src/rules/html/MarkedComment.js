const BaseRule = require('src/rules/Base');

class MarkedCommentRule extends BaseRule {
    /**
     *
     * @param {PatchronContext} patchronContext
     * @param {object} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);
    }

    invoke() {
        return [];
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `TBA :thinking:`;
    }
}

module.exports = MarkedCommentRule;
