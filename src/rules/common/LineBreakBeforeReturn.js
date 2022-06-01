/// <reference path="../../config/type-definitions/rules/common/LineBreakBeforeReturn.js" />

const BaseRule = require('src/rules/Base');

/**
 * @property {object} this
 * @property {Helpers} this.helpers
 */
class LineBreakBeforeReturnRule extends BaseRule {
    /**
     * @param {PepegaContext} pepegaContext
     * @param {LineBreakBeforeReturnConfig} config
     * @param {Patch} file
     */
    constructor(pepegaContext, _, file) {
        super(pepegaContext, file);
    }

    // cases to handle
    /**
     * IF NEW_LINE ABOVE RETURN -> DON'T CARE
     * IF NOT NEW LINE ABOVE RETURN:
     * - use regex pattern to exclude string possibility on trimmedContent
     * --- return blablabla
     *
     * if (...) {
     *  return 2;
     * }
     *
     * // get content Nesting
     * - if from === to then return it's singleLiner
     * - if from !== to we need to count number of lines
     */
    invoke() {
        const data = this.setupData(this.file.splitPatch);
        const dataLength = data.length;

        const contentNesting = this.helpers.getContentNesting(data);

        let previousContent = null;
        const reviewComments = [];

        for (let index = 0; index < dataLength; index++) {
            const { trimmedContent } = data[index];

            if (!trimmedContent.startsWith('return')) {
                previousContent = trimmedContent;

                continue;
            }

            if (previousContent === this.NEWLINE) {
                previousContent = trimmedContent;

                continue;
            }

            const returnNestBlock = this._findNearestNesting(
                contentNesting,
                trimmedContent
            );

            if (returnNestBlock) {
                const { from, to } = returnNestBlock;

                if (
                    from === to ||
                    this._countNestedBlockLength(data, returnNestBlock) === 1
                ) {
                    continue;
                }
            } else {
                if (
                    this._startsWithStatement(trimmedContent) ||
                    this._startsWithStatement(previousContent)
                ) {
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

    _findNearestNesting(contentNesting, rowContent) {
        const leftBraceIndex = rowContent.indexOf('{');

        for (let index = contentNesting.length - 1; index > 0; index--) {
            const nesting = contentNesting[index];
            const { from, to } = nesting;

            if (
                (from === index && leftBraceIndex === 0) ||
                (from < index && to >= index)
            ) {
                return nesting;
            }
        }

        return null;
    }

    _countNestedBlockLength(data, block) {
        let length = 0;
        const { from, to } = block;

        for (let index = from + 1; index < to; index++) {
            const { trimmedContent } = data[index];

            if ([this.DELETED, this.MERGED].includes(trimmedContent)) {
                continue;
            }

            length++;
        }

        return length;
    }

    _startsWithStatement(rowContent) {
        const statements = ['if', 'else', 'for', 'do', 'while'];

        for (const statement of statements) {
            if (rowContent.startsWith(statement)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `TBA`;
    }
}

module.exports = LineBreakBeforeReturnRule;
