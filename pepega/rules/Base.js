const constants = require('../config/constants');
const EventLog = require('../utilities/EventLog');
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

        this.logFatal = EventLog.logFatal;
        this.logError = EventLog.logError;
        this.logWarning = EventLog.logWarning;
        this.logInformation = EventLog.logInformation;
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
        const splitPatchLength = splitPatch.length;

        for (let index = 0; index < splitPatchLength; index++) {
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

            if (row.startsWith(this.DELETED)) {
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

        const isAddedLine = row.startsWith(this.ADDED);
        const isMergeLine = row.startsWith(this.DELETED);
        const isUnchangedLine = row.startsWith(this.UNCHANGED);

        if (isUnchangedLine || isAddedLine || isMergeLine) {
            rawContent = row.slice(1);
        }

        return rawContent;
    }

    /**
     * tests if given line is newline
     *
     * **\/\/ apply only to lines that are coming directly from splitPatch**
     * @param {string} line to check
     * @returns {boolean}
     */
    isNewline(line) {
        return [this.ADDED, this.EMPTY].includes(removeWhitespaces(line));
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

    /**
     * counts template literals (`) occurences in given line
     * @param {string} line
     * @returns {number}
     */
    countBackticks(line) {
        let counter = line.split('`').length;

        return line.includes('`') ? counter : 0;
    }

    /**
     * @param {Array<object>} data
     * @param {number} startIndex - index of row where `countBackticks` returned un
     * @returns {object}
     */
    findUnevenBackticksCount(data, startIndex) {
        const partOfData = data.slice(startIndex + 1);

        return partOfData.find(
            ({ trimmedContent }) =>
                this._countBackticks(trimmedContent) % 2 !== 0
        );
    }

    /**
     * extends `setupData` collection with information about multi line strings, built with backticks that can contain interpolated fragments. Note that received patch can contain part of multi line string. In such case line won't be considered as multi line string. Lines that contain multi line strings will be expanded with following properties:
     *
     * ```js
     *  {
     *      multiLineString: {
     *          startsAt: number, // index of line of multi line string in `data` array
     *          endsAt: number,
     *          thisRow: {
     *              firstBacktickAt: number, // -1 if none found
     *              lastBacktickAt: number, // -1 if none found,
     *              count: number
     *          }
     *      }
     *  }
     * ```
     *
     * @param {Array<object>} data
     * @returns {Array<object>}
     */
    extendDataWithBackticks(data) {
        const matchedData = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const { trimmedContent } = data[index];

            const trimmedContentBackticksCount =
                this.countBackticks(trimmedContent);

            if (trimmedContentBackticksCount % 2 !== 0) {
                const { index: nextUnevenBackticksCount } =
                    this.findUnevenBackticksCount(data, index);

                if (nextUnevenBackticksCount) {
                    for (; index <= nextUnevenBackticksCount; index++) {
                        const { trimmedContent: line } = data[index];

                        matchedData.push({
                            ...data[index],
                            multiLineString: {
                                startsAt: index,
                                endsAt: nextUnevenBackticksCount,
                                thisRow: {
                                    firstBacktickAt: line.indexOf('`'),
                                    lastBacktickAt: line.lastIndexOf('`'),
                                    totalBackticks: this.countBackticks(line)
                                }
                            }
                        });
                    }

                    continue;
                }
            }

            matchedData.push({
                ...data[index],
                multiLineString: null
            });
        }
    }
}

module.exports = BaseRule;
