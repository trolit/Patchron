const BaseRule = require('src/rules/Base');

class LoopLengthConditionInitialization extends BaseRule {
    /**
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
        const reviewComments = [];

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            let isSingleLine = false;
            const { trimmedContent } = row;
            let isLoopConditionValid = true;

            const fixedContent = trimmedContent.startsWith('}')
                ? trimmedContent.slice(1).trim()
                : trimmedContent;

            if (!this._startsWithStatement(fixedContent)) {
                continue;
            }

            const endIndex = this._findEndIndex(data, index);

            if (fixedContent.startsWith('for')) {
                isSingleLine = fixedContent.match(/for.*\(.*;.*;.*\)/);

                if (isSingleLine) {
                    const firstSemicolon = fixedContent.indexOf(';');
                    const secondSemicolon = fixedContent.indexOf(
                        ';',
                        firstSemicolon + 1
                    );

                    const conditionStatement = fixedContent.slice(
                        firstSemicolon,
                        secondSemicolon + 1
                    );

                    isLoopConditionValid =
                        this._matchLengthReference(conditionStatement) === null;
                } else if (endIndex) {
                    isLoopConditionValid = this._isMultiLineLoopValid(
                        data,
                        index,
                        endIndex,
                        'for'
                    );
                }
            } else if (fixedContent.startsWith('while')) {
                isSingleLine = fixedContent.match(/while.*\(.*\)/);

                if (isSingleLine) {
                    isLoopConditionValid =
                        this._matchLengthReference(fixedContent) === null;
                } else if (endIndex) {
                    isLoopConditionValid = this._isMultiLineLoopValid(
                        data,
                        index,
                        endIndex,
                        'while'
                    );
                }
            }

            if (!isLoopConditionValid) {
                reviewComments.push(
                    this.getSingleLineComment({
                        body: this._getCommentBody(),
                        index
                    })
                );
            }

            if (!isSingleLine && endIndex) {
                index = endIndex;
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

    _isMultiLineLoopValid(data, index, endIndex, loopType) {
        let localIndex = loopType === 'for' ? index + 2 : index + 1;

        for (; localIndex < endIndex; localIndex++) {
            const { trimmedContent } = data[localIndex];

            if (this._matchLengthReference(trimmedContent)) {
                return false;
            }
        }

        return true;
    }

    _matchLengthReference(content) {
        return content.match(/(\w+).length/);
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `TBA`;
    }
}

module.exports = LoopLengthConditionInitialization;
