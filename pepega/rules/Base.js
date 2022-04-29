const constants = require('../config/constants');
const getPosition = require('../helpers/getPosition');
const getLineNumber = require('../helpers/getLineNumber');
const ReviewCommentBuilder = require('../builders/ReviewComment');
const removeWhitespaces = require('../helpers/removeWhitespaces');

class BaseRule {
    constructor() {
        const {
            ADDED,
            EMPTY,
            LEFT,
            MERGE,
            RIGHT,
            DELETED,
            NEWLINE,
            UNCHANGED,
            CUSTOM_LINES,
            COMMENTED_LINE
        } = constants;

        this.MERGE = MERGE;
        this.NEWLINE = NEWLINE;
        this.CUSTOM_LINES = CUSTOM_LINES;
        this.COMMENTED_LINE = COMMENTED_LINE;

        this.ADDED = ADDED;
        this.DELETED = DELETED;
        this.UNCHANGED = UNCHANGED;

        this.LEFT = LEFT;
        this.RIGHT = RIGHT;

        this.EMPTY = EMPTY;
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
            side
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
            position
        });

        return comment;
    }

    /**
     * Cleans received patch
     */
    setupData(splitPatch) {
        let data = [];

        for (let index = 0; index < splitPatch.length; index++) {
            const row = splitPatch[index];

            const rawRow = this.getRawContent(row);
            const indentation = rawRow.search(/\S|$/);

            if (this.isLineCommented(rawRow)) {
                data.push({
                    index,
                    indentation,
                    content: this.COMMENTED_LINE,
                    trimmedContent: this.COMMENTED_LINE
                });

                continue;
            }

            if (this.isNewline(row)) {
                data.push({
                    index,
                    indentation,
                    content: this.NEWLINE,
                    trimmedContent: this.NEWLINE
                });

                continue;
            }

            if (this.isMergeLine(row)) {
                data.push({
                    index,
                    indentation,
                    content: this.MERGE,
                    trimmedContent: this.MERGE
                });

                continue;
            }

            data.push({
                index,
                indentation,
                content: rawRow,
                trimmedContent: rawRow.trim()
            });
        }

        return data;
    }

    /**
     * Removes from row indicators added by Git (added, deleted, unchanged)
     * @param {string} row
     */
    getRawContent(row) {
        let rawContent = row;

        if (
            this.isUnchangedLine(row) ||
            this.isAddedLine(row) ||
            this.isMergeLine(row)
        ) {
            rawContent = row.slice(1);
        }

        return rawContent;
    }

    /**
     * **\/\/ apply only to lines from splitPatch!!**
     *
     * tests if given line is added line
     * @param {string} line to check
     * @returns {boolean}
     */
    isAddedLine(line) {
        return line.startsWith(this.ADDED);
    }

    /**
     * **\/\/ apply only to lines from splitPatch!!**
     *
     * tests if given line is newline
     * @param {string} line to check
     * @returns {boolean}
     */
    isNewline(line) {
        return [this.ADDED, this.EMPTY].includes(removeWhitespaces(line));
    }

    /**
     * **\/\/ apply only to lines from splitPatch!!**
     *
     * tests if given line is merge
     * @param {string} line to check
     * @returns {boolean}
     */
    isMergeLine(line) {
        return line.startsWith(this.DELETED);
    }

    /**
     * **\/\/ apply only to lines from splitPatch!!**
     *
     * tests if given line is unchanged
     * @param {string} line to check
     * @returns {boolean}
     */
    isUnchangedLine(line) {
        return line.startsWith(this.UNCHANGED);
    }

    /**
     * determines whether passed line is:
     *
     * - start of multi-line (fragment = start) (default)
     * - end of multi-line (fragment = end)
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

    /**
     * @param {Array} data - array received via `setupData(splitPatch)`
     * @param {string} keyword
     * @param {number} endIndex
     * @returns {number}
     */
    getMultiLineStartIndex(data, keyword, endIndex) {
        let multilineStartIndex = -1;

        for (let index = endIndex - 1; index >= 0; index--) {
            const { trimmedContent } = data[index];

            if (
                trimmedContent !== this.MERGE &&
                this.isPartOfMultiLine(keyword, trimmedContent)
            ) {
                multilineStartIndex = index;

                break;
            }
        }

        return multilineStartIndex;
    }

    /**
     * @param {Array} data - array received via `setupData(splitPatch)`
     * @param {string} keyword
     * @param {number} startIndex
     * @returns {number}
     */
    getMultiLineEndIndex(data, keyword, startIndex) {
        let multilineEndIndex = -1;
        const dataLength = data.length;

        for (let index = startIndex + 1; index < dataLength; index++) {
            const { trimmedContent } = data[index];

            if (
                trimmedContent !== this.MERGE &&
                this.isPartOfMultiLine(keyword, trimmedContent, 'end')
            ) {
                multilineEndIndex = index;

                break;
            }
        }

        return multilineEndIndex;
    }

    logError(filename, message, testedFile = null) {
        probotInstance.log.error(
            `${filename} >>>${
                testedFile ? ` (${testedFile?.fileName})` : ``
            }\n${message}`
        );
    }

    /**
     * @param {Array<object>} data - array of objects containing `trimmedContent` property
     * @param {integer} startsAt
     * @param {integer} endsAt
     * @returns {string}
     */
    convertMultiLineToSingleLine(data, startsAt, endsAt) {
        const slicedPart = data.slice(startsAt, endsAt + 1);

        return slicedPart.map(({ trimmedContent }) => trimmedContent).join(' ');
    }

    /**
     * determines whether passed line starts with //, /*, * or *\/
     * @param {string} line
     * @returns {boolean}
     */
    isLineCommented(line) {
        const matchResult = line.match(/^(\/\/|\/\*|\*\/|\*)/);

        return !!matchResult;
    }
}

module.exports = BaseRule;
