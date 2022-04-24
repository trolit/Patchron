const BaseRule = require('../Base');
const getContentNesting = require('../../helpers/getContentNesting');

class SingleLineBlockRule extends BaseRule {
    /**
     * Please note that:
     * - if provided block does not end by curly brace or single line, assign regular expression under `endIndicator` property to specify block end manually. For instance `endIndicator` of `do..while` could be ```/^while/```
     * - if blocks have similiar parts, pay attention to their order e.g. if..else if..else and/or regular expression
     * @param {object} config
     * @param {Array<{name: string, expression: object, endIndicator: object?}>} config.blocks
     * @param {boolean} config.curlyBraces - true indicates that matched blocks should be wrapped with curly braces {}
     */
    constructor(config) {
        super();

        const { blocks, curlyBraces } = config;

        this.blocks = blocks;
        this.curlyBraces = curlyBraces;
    }

    invoke(file) {
        if (!this.blocks.length) {
            this.logError(__filename, 'No blocks defined.', file);

            return [];
        }

        const { split_patch: splitPatch } = file;

        if (!splitPatch) {
            this.logError(__filename, 'Empty patch', file);

            return [];
        }

        const data = this.setupData(splitPatch);

        if (!this._includesAnyMatch(data)) {
            return [];
        }

        const contentNesting = getContentNesting(data);

        const singleLineBlocks = this._getSingleLineBlocks(
            data,
            contentNesting
        );

        const reviewComments = this._reviewSingleLineBlocks(
            file,
            singleLineBlocks
        );

        return reviewComments;
    }

    _includesAnyMatch(data) {
        return data.some(({ content }) =>
            this.blocks.some((block) => content.match(block.expression))
        );
    }

    _reviewSingleLineBlocks(file, singleLineBlocks) {
        let reviewComments = [];

        for (const singleLineBlock of singleLineBlocks) {
            const { from, to, isWithBraces } = singleLineBlock;

            if (this.curlyBraces !== isWithBraces) {
                const body = this._getCommentBody();

                reviewComments.push(
                    from === to
                        ? this.getSingleLineComment({
                              file,
                              index: from,
                              body
                          })
                        : this.getMultiLineComment({
                              file,
                              from,
                              to,
                              body
                          })
                );
            }
        }

        return reviewComments;
    }

    _getSingleLineBlocks(data, contentNesting) {
        const endIndicators = [];
        const singleLineBlocks = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const { content } = row;

            if (endIndicators?.length) {
                const endIndicatorIndex = endIndicators.findIndex(
                    (endIndicator) => content.match(endIndicator)
                );

                if (~endIndicatorIndex) {
                    endIndicators.splice(endIndicatorIndex, 1);

                    continue;
                }
            }

            if (this.CUSTOM_LINES.includes(content)) {
                continue;
            }

            const block = this._findMatchingBlock(content);

            if (!block) {
                continue;
            }

            const nextRow = index + 1 < dataLength ? data[index + 1] : null;

            const isWithBraces = this._isWithBraces(
                contentNesting,
                row,
                nextRow
            );

            let to;
            const from = row.index;

            if (block?.endIndicator) {
                to = this._getEndIndicatorIndex(data, block, row);

                endIndicators.push(block.endIndicator);
            } else {
                to = this._getEndIndex(
                    contentNesting,
                    block,
                    row,
                    isWithBraces
                );
            }

            if (this._isValidBlock(from, to)) {
                singleLineBlocks.push({
                    from,
                    to,
                    isWithBraces
                });
            }
        }

        return singleLineBlocks;
    }

    _isValidBlock(from, to) {
        const isSingleLineBlock = from === to;

        const isMultiLineBlockWithBraces = to - from - 1 === 1;

        const isMultiLineBlockWithoutBraces = to - from === 1;

        return (
            isSingleLineBlock ||
            isMultiLineBlockWithBraces ||
            isMultiLineBlockWithoutBraces
        );
    }

    _findMatchingBlock(content) {
        return this.blocks.find(({ expression }) => content.match(expression));
    }

    _isWithBraces(contentNesting, row, nextRow = null) {
        const { index } = row;

        if (!nextRow) {
            return contentNesting.some(({ from }) => from === index);
        }

        return contentNesting.some(
            ({ from }) => from === index || nextRow.content.startsWith('{')
        );
    }

    _getEndIndicatorIndex(data, block, row) {
        let endIndex = -1;
        let matchesToSkip = 0;

        for (let index = row.index + 1; index < data.length; index++) {
            const nextRow = data[index];

            const nextRowBlock = this._findMatchingBlock(nextRow.content);

            if (block === nextRowBlock) {
                matchesToSkip++;

                continue;
            }

            const isEndIndicator = nextRow.content.match(block.endIndicator);

            if (isEndIndicator && matchesToSkip) {
                matchesToSkip--;
            } else if (isEndIndicator && !matchesToSkip) {
                endIndex = index;

                break;
            }
        }

        return endIndex;
    }

    _getEndIndex(contentNesting, block, row, isWithBraces) {
        if (isWithBraces) {
            const { to } = contentNesting.find(({ from }) =>
                [row.index, row.index + 1].includes(from)
            );

            return to;
        } else {
            const { content } = row;
            const { expression } = block;

            const expressionAsString = expression.toString().replace(/\//g, '');

            const rawBlockExpression = expressionAsString.endsWith('.*')
                ? expressionAsString.slice(0, -2)
                : expressionAsString;

            const rawBlockMatch = content.match(rawBlockExpression);

            if (!rawBlockMatch) {
                return -1;
            }

            const rawBlock = rawBlockMatch[0];

            const contentLength = content.length;
            const rawBlockLength = rawBlock.length;

            const extraBlockContent = content.substr(rawBlockLength).trim();

            return contentLength > rawBlockLength &&
                !this.isLineCommented(extraBlockContent)
                ? row.index
                : row.index + 1;
        }
    }

    _withBracesInTheSameLine(contentNesting, row) {
        const rowContentNesting = contentNesting.find(
            ({ from }) => from === row.index
        );

        if (!rowContentNesting) {
            return false;
        }

        const { from, to } = rowContentNesting;

        return from === to;
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `This single-line block should${
            this.curlyBraces ? `` : `n't`
        } be wrapped with curly braces.`;
    }
}

module.exports = SingleLineBlockRule;
