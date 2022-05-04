const BaseRule = require('../Base');

class ValueComparisionStyleRule extends BaseRule {
    /**
     * Allows to set expected equality/inequality comparement convention.
     *
     * **available level** options:
     * - 0 - weak
     * - 1 - strict
     * - 2 - Object.is (ES6 feature)
     * @param {object} config
     * @param {number} config.level
     *
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
