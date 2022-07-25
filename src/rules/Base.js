const dedent = require('dedent-js');
const helpers = require('src/helpers');
const constants = require('src/config/constants');
const ReviewCommentBuilder = require('src/builders/ReviewComment');
const extendWithBackticks = require('src/extensions/setup-data/extendWithBackticks');

class BaseRule {
    /**
     * @param {PatchronContext} patchronContext
     * @param {Patch} file
     */
    constructor(patchronContext, file = null) {
        this.patchronContext = patchronContext;
        this.log = this.patchronContext.log;

        if (file) {
            this.file = file;

            this.reviewCommentBuilder = new ReviewCommentBuilder(
                patchronContext,
                file
            );
        }

        const {
            ADDED,
            EMPTY,
            LEFT,
            MERGE,
            RIGHT,
            DELETED,
            NEWLINE,
            BLOCK_END,
            UNCHANGED,
            BLOCK_START,
            CUSTOM_LINES,
            COMMENTED_LINE,
            HUNK_HEADER_INDICATOR
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
        this.BLOCK_END = BLOCK_END;
        this.BLOCK_START = BLOCK_START;
        this.HUNK_HEADER_INDICATOR = HUNK_HEADER_INDICATOR;

        this.dedent = dedent;

        this.helpers = helpers;
    }

    /**
     * @returns {object}
     */
    getSingleLineComment({ body, index, side = 'RIGHT' }) {
        const { splitPatch } = this.file;

        const line = this.helpers.getLineNumber(splitPatch, side, index);

        const comment = this.reviewCommentBuilder.buildSingleLineComment({
            body,
            line,
            side
        });

        return comment;
    }

    /**
     * @returns {object}
     */
    getMultiLineComment({ body, from, to, side = 'RIGHT' }) {
        const { splitPatch } = this.file;

        const start_line = this.helpers.getLineNumber(splitPatch, side, from);

        const position = this.helpers.getPosition(splitPatch, to, side);

        const comment = this.reviewCommentBuilder.buildMultiLineComment({
            body,
            start_line,
            start_side: side,
            position
        });

        return comment;
    }

    /**
     * sets up received patch
     *
     * @returns {Array<SplitPatchRow>}
     */
    setupData(
        splitPatch,
        extensions = {
            withBackticks: null
        }
    ) {
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

        if (extensions?.withBackticks) {
            data = extendWithBackticks(
                data,
                extensions.withBackticks?.settings
            );
        }

        return data;
    }

    /**
     * Removes from row indicators added by Git (added, deleted, unchanged)
     *
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
     *
     * @param {string} line to check
     * @returns {boolean}
     */
    isNewline(line) {
        return [this.ADDED, this.EMPTY].includes(
            this.helpers.removeWhitespaces(line)
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
     *
     * @param {string} line
     * @returns {boolean}
     */
    isLineCommented(line) {
        const matchResult = line.match(/^(\/\/|\/\*|\*\/|\*)/);

        return !!matchResult;
    }
}

module.exports = BaseRule;
