const getPosition = require('../helpers/getPosition');
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
    getSingleLineComment({ file, body, index, side = 'RIGHT' }) {
        const { split_patch: splitPatch } = file;

        const line = getLineNumber(splitPatch, side, index);

        const reviewCommentBuilder = new ReviewCommentBuilder(file);

        const comment = reviewCommentBuilder.buildSingleLineComment({
            body,
            line,
            side,
        });

        return comment;
    }

    /**
     * @returns {object}
     */
    getMultilineComment({ file, body, from, to, side = 'RIGHT' }) {
        const { split_patch: splitPatch } = file;

        const start_line = getLineNumber(splitPatch, side, from);

        const position = getPosition(splitPatch, to);

        const reviewCommentBuilder = new ReviewCommentBuilder(file);

        const comment = reviewCommentBuilder.buildMultiLineComment({
            body,
            start_line,
            start_side: side,
            position,
        });

        return comment;
    }

    /**
     * Prepares data for keyword that makes use of regular expression to match
     * rows. Translates line breaks into "newLine" and deleted lines into "merge".
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
                keyword?.multilineOptions &&
                this._isMultiline(keyword, content)
            ) {
                const multilineEndIndex = this._resolveMultilineMatch(
                    keyword,
                    splitPatch,
                    index
                );

                let content = splitPatch[multilineEndIndex].trim();

                if (content.startsWith('+')) {
                    content = content.slice(1);
                }

                matchedRows.push({
                    index,
                    content,
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
