const getLineNumber = require('../helpers/getLineNumber');
const ReviewCommentBuilder = require('../builders/ReviewComment');
const removeWhitespaces = require('../helpers/removeWhitespaces');

class BaseRule {
    constructor() {
        const merge = '<<< merge >>>';
        const newLine = '<<< new line >>>';

        this.merge = merge;
        this.newLine = newLine;
        this.customLines = [newLine, merge];
    }

    /**
     * @returns {object}
     */
    getSingleLineComment(file, body, rowIndex, side = 'RIGHT') {
        const { split_patch: splitPatch } = file;

        const line = getLineNumber(splitPatch, 'right', rowIndex);

        const reviewCommentBuilder = new ReviewCommentBuilder(file);

        const comment = reviewCommentBuilder.buildSingleLineComment({
            body,
            line,
            side,
        });

        return comment;
    }

    /**
     * dad
     */
    initializeRegexBasedData(splitPatch, keyword) {
        let matchedRows = [];
        let unchangedRows = [];

        for (let index = 0; index < splitPatch.length; index++) {
            const row = splitPatch[index];

            if (matchedRows.length && removeWhitespaces(row) === '+') {
                matchedRows.push({
                    index,
                    content: this.newLine,
                });

                continue;
            } else if (matchedRows.length && row.startsWith('-')) {
                matchedRows.push({
                    index,
                    content: this.merge,
                });

                continue;
            } else if (matchedRows.length && row.startsWith(' ')) {
                unchangedRows.push({
                    index,
                    content: row.trim(),
                });
            }

            const matchResult = row.match(keyword.regex);

            if (!matchResult) {
                continue;
            }

            const content = matchResult[0].trim();

            if (
                keyword?.multilineOptions?.length &&
                this._isMultiline(keyword, content)
            ) {
                const multilineEndIndex = this._resolveMultilineMatch(
                    keyword,
                    splitPatch,
                    index
                );

                matchedRows.push({
                    index,
                    content: splitPatch[multilineEndIndex].trim(),
                    length: multilineEndIndex - index,
                });

                index = multilineEndIndex;

                continue;
            }

            matchedRows.push({
                index,
                content,
            });
        }

        return {
            matchedRows,
            unchangedRows,
        };
    }

    _isMultiline(keyword, line) {
        const { multilineOptions } = keyword;

        return !multilineOptions.some((option) => line.includes(option));
    }

    _resolveMultilineMatch(keyword, splitPatch, currentIndex) {
        let multilineEndIndex = -1;

        for (let index = currentIndex + 1; index < splitPatch.length; index++) {
            const row = splitPatch[index];

            if (
                !row.startsWith('-') &&
                removeWhitespaces(row) !== '+' &&
                !this._isMultiline(keyword, row)
            ) {
                multilineEndIndex = index;

                break;
            }
        }

        return multilineEndIndex;
    }
}

module.exports = BaseRule;
