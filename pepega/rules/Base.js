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
                this.isPartOfMultiLine(keyword, content)
            ) {
                const multilineEndIndex = this.getMultiLineEndIndex(
                    splitPatch,
                    keyword,
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

    /**
     * tests if given text is new line (apply only to raw splitPatch)
     * @param {string} text to check
     * @returns {boolean}
     */
    isNewLine(content) {
        return ['+', ''].includes(removeWhitespaces(content));
    }

    /**
     * tests if given text is merge line (apply only to raw splitPatch)
     * @param {string} text to check
     * @returns {boolean}
     */
    isMergeLine(content) {
        return content.startsWith('-');
    }

    /**
     * determines whether passed line is start of multi-line (direction = bottom) or end of multi-line (direction = top)
     * @param {object} keyword - keyword, **must** contain **multiLineOptions** array
     * @param {string} line - text of line
     * @param {string} fragment - start/end (start is default value)
     * @returns {boolean}
     */
    isPartOfMultiLine(keyword, line, fragment = 'start') {
        const { multilineOptions } = keyword;

        const includesMultiLineOption = multilineOptions.some((option) =>
            line.includes(option)
        );

        return fragment === 'start'
            ? !includesMultiLineOption && line.match(keyword.regex)
            : includesMultiLineOption && !line.match(keyword.regex);
    }

    getMultiLineStartIndex(splitPatch, keyword, endIndex) {
        let multilineStartIndex = -1;

        for (let index = endIndex - 1; index >= 0; index--) {
            const row = splitPatch[index];

            if (
                !this.isMergeLine(row) &&
                this.isPartOfMultiLine(keyword, row)
            ) {
                multilineStartIndex = index;

                break;
            }
        }

        return multilineStartIndex;
    }

    getMultiLineEndIndex(splitPatch, keyword, startIndex) {
        let multilineEndIndex = -1;
        const splitPatchLength = splitPatch.length;

        for (let index = startIndex + 1; index < splitPatchLength; index++) {
            const row = splitPatch[index];

            if (
                !this.isMergeLine(row) &&
                this.isPartOfMultiLine(keyword, row, 'end')
            ) {
                multilineEndIndex = index;

                break;
            }
        }

        return multilineEndIndex;
    }

    logError(filename, testedFile, message) {
        probotInstance.log.error(
            `${filename} >>> (${testedFile?.filename})\n${message}`
        );
    }

    /**
     * @param {Array<object>} data - array of objects containing `content` property
     * @param {integer} startsAt
     * @param {integer} endsAt
     * @returns {string}
     */
    convertMultiLineToSingleLine(data, startsAt, endsAt) {
        const slicedPart = data.slice(startsAt, endsAt + 1);

        return slicedPart.map(({ content }) => content).join(' ');
    }
}

module.exports = BaseRule;
