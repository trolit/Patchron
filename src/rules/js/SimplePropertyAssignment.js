const BaseRule = require('src/rules/Base');

class SimplePropertyAssignmentRule extends BaseRule {
    /**
     * @param {PatchronContext} patchronContext
     * @param {object} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);
    }

    invoke() {
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `TBA`;
    }
}

module.exports = SimplePropertyAssignmentRule;
