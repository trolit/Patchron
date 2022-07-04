const BaseRule = require('src/rules/Base');

class SimpleComparisionRule extends BaseRule {
    /**
     * @param {PatchronContext} patchronContext
     * @param {SimpleComparisionRuleConfig} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

        const { patterns } = config;

        this.patterns = patterns;
    }

    invoke() {
        if (!this.patterns?.length) {
            this.log.warning(
                __filename,
                'No patterns defined. Rule review skipped.',
                this.file
            );

            return [];
        }

        const reviewComments = [];
        const { splitPatch } = this.file;
        const data = this.setupData(splitPatch);
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const { trimmedContent } = data[index];

            if (this.CUSTOM_LINES.includes(trimmedContent)) {
                continue;
            }

            const matchedPattern = this.patterns.find((pattern) =>
                trimmedContent.match(pattern.expression)
            );

            if (matchedPattern) {
                reviewComments.push(
                    this.getSingleLineComment({
                        body: this._getCommentBody(matchedPattern),
                        index
                    })
                );
            }
        }

        return reviewComments;
    }

    /**
     * @returns {string}
     */
    _getCommentBody(matchedPattern) {
        const commentBody = `It seems that code can be simplified.

        ${matchedPattern.comment}
        `;

        return this.dedent(commentBody);
    }
}

module.exports = SimpleComparisionRule;
