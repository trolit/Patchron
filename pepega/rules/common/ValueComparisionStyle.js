const BaseRule = require('../Base');

class ValueComparisionStyleRule extends BaseRule {
    /**
     * Allows to set expected equality/inequality comparement convention. Rule by default covers basic patterns which are:
     * - `... (condition) ...`
     * - `condition ? ... : ...`
     * - interpolated cases (backticks)
     *
     * If you would like to add Vue condition (v-if), add expression to `specificPatterns` array.
     *
     * **available level** options:
     * - 0 - weak
     * - 1 - strict
     * - 2 - Object.is (ES6 feature)
     * @param {object} config
     * @param {Array<number>} config.allowedLevels
     * @param {Array<object>} config.specificPatterns
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_inequality
     */
    constructor(config) {
        super();

        const { level } = config;

        this.level = level;
    }

    invoke(file) {
        const { split_patch: splitPatch } = file;

        const data = this.setupData(splitPatch);

        const reviewComments = [];

        return reviewComments;
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `This single-line block should${
            this.curlyBraces ? `` : `n't`
        } be wrapped with curly braces.`;
    }
}

module.exports = ValueComparisionStyleRule;
