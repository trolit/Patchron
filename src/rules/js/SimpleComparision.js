const BaseRule = require('src/rules/Base');

class SimpleComparisionRule extends BaseRule {
    /**
     * allows to define set of `patterns` which when matched, will be commented out to the PR owner. `comment` property from `pattern` object allows to include for instance suggestion how matched code can be simplified.
     *
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
            const { trimmedContent, index: rowIndex } = data[index];

            if (
                this.CUSTOM_LINES.includes(trimmedContent) ||
                trimmedContent.startsWith(this.HUNK_HEADER_INDICATOR)
            ) {
                continue;
            }

            for (const pattern of this.patterns) {
                if (trimmedContent.match(pattern.regex)) {
                    reviewComments.push(
                        this.getSingleLineComment({
                            body: this._getCommentBody(pattern),
                            index: rowIndex
                        })
                    );

                    break;
                }

                if (!pattern?.multiLineOptions) {
                    continue;
                }

                const { multiLineOptions } = pattern;

                const multiLineStructure = this.helpers.getMultiLineStructure(
                    data,
                    index,
                    multiLineOptions
                );

                if (!multiLineStructure.isMultiLine) {
                    continue;
                }

                const { endIndex } = multiLineStructure;

                if (~endIndex) {
                    const content = this.convertMultiLineToSingleLine(
                        data,
                        index,
                        endIndex
                    );

                    if (content.match(pattern.regex)) {
                        reviewComments.push(
                            this.getMultiLineComment({
                                body: this._getCommentBody(pattern),
                                from: rowIndex,
                                to: endIndex
                            })
                        );

                        break;
                    }
                }
            }
        }

        return reviewComments;
    }

    /**
     * @returns {string}
     */
    _getCommentBody(matchedPattern) {
        const commentBody = `Please, simplify marked code.

        ${matchedPattern.comment}
        `;

        return this.dedent(commentBody);
    }
}

module.exports = SimpleComparisionRule;
