/// <reference path="../../config/type-definitions/rules/common/LineBreakBeforeReturn.js" />

const BaseRule = require('src/rules/Base');

class LineBreakBeforeReturnRule extends BaseRule {
    /**
     * @param {PepegaContext} pepegaContext
     * @param {LineBreakBeforeReturnConfig} config
     * @param {Patch} file
     */
    constructor(pepegaContext, config, file) {
        super(pepegaContext, file);
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

module.exports = LineBreakBeforeReturnRule;
