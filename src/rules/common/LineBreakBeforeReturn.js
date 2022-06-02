/// <reference path="../../config/type-definitions/rules/common/LineBreakBeforeReturn.js" />

const BaseRule = require('src/rules/Base');

/**
 * @property {object} this
 * @property {Helpers} this.helpers
 */
class LineBreakBeforeReturnRule extends BaseRule {
    /**
     * Checks whether line before return is line-break. Custom exceptions can be passed via `beforeReturnExceptions` property. Note that edge case (part of string starting with return) isn't covered since amount of intel in received patch can be not enough to determine that and on the other hand it's still rare case.
     *
     * @param {PepegaContext} pepegaContext
     * @param {LineBreakBeforeReturnConfig} config
     * @param {Patch} file
     */
    constructor(pepegaContext, config, file) {
        super(pepegaContext, file);

        const { beforeReturnExceptions } = config;

        this.beforeReturnExceptions = beforeReturnExceptions;
    }

    invoke() {
        const data = this.setupData(this.file.splitPatch);
        const dataLength = data.length;

        const contentNesting = this.helpers.getContentNesting(data);
        const contentNestingLength = contentNesting.length;

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

            if (
                this._startsWithStatement(trimmedContent) ||
                this._startsWithStatement(previousContent) ||
                previousContent.startsWith('{')
            ) {
                previousContent = trimmedContent;

                continue;
            }

            const returnNestBlock =
                contentNestingLength === 1 || contentNestingLength % 2 === 0
                    ? this._findNearestNesting(
                          contentNesting,
                          index,
                          trimmedContent
                      )
                    : null;

            if (returnNestBlock) {
                const { from, to } = returnNestBlock;

                if (
                    from === to ||
                    this._countNestedBlockLength(data, returnNestBlock) === 1
                ) {
                    previousContent = trimmedContent;

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

    _findNearestNesting(contentNesting, rowIndex, rowContent) {
        const leftBraceIndex = rowContent.indexOf('{');

        for (let index = contentNesting.length - 1; index >= 0; index--) {
            const nesting = contentNesting[index];
            const { from, to } = nesting;

            if (
                (from === rowIndex && leftBraceIndex === 0) ||
                (from < rowIndex && to >= rowIndex)
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
