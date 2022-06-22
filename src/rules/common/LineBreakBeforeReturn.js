/// <reference path="../../config/type-definitions/common.js" />

const BaseRule = require('src/rules/Base');

class LineBreakBeforeReturnRule extends BaseRule {
    /**
     * Checks whether line before return is line-break. Note that edge case (part of string starting with return) isn't covered since amount of intel in received patch can be not enough to determine that and on the other hand it's still rare case.
     *
     * @param {PatchronContext} patchronContext
     * @param {object} _
     * @param {Patch} file
     */
    constructor(patchronContext, _, file) {
        super(patchronContext, file);
    }

    invoke() {
        const data = this.setupData(this.file.splitPatch);
        const dataLength = data.length;

        let previousContent = null;
        const reviewComments = [];
        const dataStructure = this.helpers.getDataStructure(data);

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const { trimmedContent } = row;

            if (
                !trimmedContent.startsWith('return') ||
                previousContent === this.NEWLINE
            ) {
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

            const rowStructure = this._findRowStructure(row, dataStructure);

            if (rowStructure) {
                const { from, to } = rowStructure;

                if (
                    from === to ||
                    this._countRowStructureLength(data, rowStructure) === 1
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

    _findRowStructure(row, dataStructure) {
        const { trimmedContent, index: rowIndex } = row;

        const leftBraceIndex = trimmedContent.indexOf('{');

        for (let index = dataStructure.length - 1; index >= 0; index--) {
            const nesting = dataStructure[index];
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

    _countRowStructureLength(data, rowStructure) {
        let length = 0;
        const { from, to } = rowStructure;

        for (let index = from + 1; index < to; index++) {
            const { trimmedContent } = data[index];

            if (trimmedContent === this.MERGE) {
                continue;
            }

            length++;
        }

        return length;
    }

    _startsWithStatement(content) {
        const statements = ['if', 'else', 'for', 'do', 'while'];

        return statements.some((statement) => content.startsWith(statement));
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `It seems that line-break is missing before \`return\` :thinking:`;
    }
}

module.exports = LineBreakBeforeReturnRule;
