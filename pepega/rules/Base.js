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

        const added = '+';
        const deleted = '-';
        const unchanged = ' ';

        this.added = added;
        this.deleted = deleted;
        this.unchanged = unchanged;
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
    getMultiLineComment({ file, body, from, to, side = 'RIGHT' }) {
        const { split_patch: splitPatch } = file;

        const start_line = getLineNumber(splitPatch, side, from);

        const position = getPosition(splitPatch, to, side);

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

            if (
                matchedRows.length &&
                ['+', ''].includes(removeWhitespaces(row))
            ) {
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

                const rawContent = this.getRawContent(
                    splitPatch[multilineEndIndex]
                );

                matchedRows.push({
                    index,
                    content: rawContent,
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

    /**
     * Removes from row indicators added by Git (added, deleted, unchanged) and hunk header (if occured)
     */
    getRawContent(row) {
        let rawContent = row;

        if (row.startsWith(this.unchanged)) {
            rawContent = row.trim();
        } else if (row.startsWith(this.added) || row.startsWith(this.deleted)) {
            rawContent = row.slice(1).trim();
        }

        return rawContent;
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
