const BaseRule = require('src/rules/Base');

/**
 * @property {object} this
 * @property {Helpers} this.helpers
 */
class LoopLengthConditionInitialization extends BaseRule {
    /**
     * (\w+).length
     *
     * @param {PepegaContext} pepegaContext
     * @param {object} _
     * @param {Patch} file
     */
    constructor(pepegaContext, _, file) {
        super(pepegaContext, file);
    }

    invoke() {
        const data = this.setupData(this.file.splitPatch);
        const dataLength = data.length;

        let previousContent = null;
        const reviewComments = [];

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const { trimmedContent } = row;

            if (!this._startsWithStatement(trimmedContent)) {
                continue;
            }

            const isSingleLine = trimmedContent.match(
                trimmedContent.startsWith('while')
                    ? /while.*\(.*\)/
                    : /for.*\(.*;.*;.*\)/
            );

            if (isSingleLine) {
            } else {
                const endIndex = this._findEndIndex(data, index);

                if (endIndex === -1) {
                    continue;
                }
            }

            if (previousContent !== this.NEWLINE) {
                reviewComments.push(
                    this.getSingleLineComment({
                        body: this._getCommentBody(),
                        index
                    })
                );
            }
        }

        return reviewComments;
    }

    _startsWithStatement(content) {
        const statements = ['for', 'while'];

        return statements.some((statement) => content.startsWith(statement));
    }

    _findEndIndex(data, index) {
        const slicedData = data.slice(index);

        const result = slicedData.find(({ trimmedContent }) =>
            trimmedContent.startsWith(')')
        );

        return result?.index || -1;
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `TBA`;
    }
}

module.exports = LoopLengthConditionInitialization;
