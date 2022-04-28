const BaseRule = require('../Base');
const getContentNesting = require('../../helpers/getContentNesting');

class SingleLineBlockRule extends BaseRule {
    /**
     * Please note that:
     * - if provided block does not end by curly brace or single line, assign regular expression under `endIndicator` property to specify block end manually. For instance `endIndicator` of `do..while` could be ```/while/``` since we have no 100% certainity that it will always appear at the start of the line.
     * - if blocks have similiar parts, pay attention to their order e.g. if..else if..else and/or regular expression
     * - each block's expression should end with `.*`
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

    _getSingleLineBlocks(data, contentNesting) {
        const rowsToSkip = [];
        const singleLineBlocks = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const { content } = row;

            if (
                this.CUSTOM_LINES.includes(content) ||
                rowsToSkip.includes(index)
            ) {
                continue;
            }

            const block = this._findMatchingBlock(content);

            if (!block) {
                continue;
            }

            const nextRow = index + 1 < data.length ? data[index + 1] : null;

            const rowNesting = this._findRowNesting(
                contentNesting,
                row,
                nextRow
            );

            let to = -1;
            const from = row.index;

            if (block?.endIndicator) {
                to = this._getEndIndicatorIndex(data, block, row);

                rowsToSkip.push(to);
            } else if (rowNesting) {
                to = rowNesting.to;
            } else {
                to = this._getEndIndex(block, row);
            }

            if (this._isSingleLineBlock(data, from, to, rowNesting)) {
                singleLineBlocks.push({
                    from,
                    to,
                    isWithBraces: !!rowNesting
                });
            }
        }

        return singleLineBlocks;
    }

    _isSingleLineBlock(data, from, to, rowNesting) {
        return (
            from === to ||
            to - from - this._countMergeLines(data, from, to) === 1 ||
            this._countBlockLength(data, from, to, rowNesting) === 1
        );
    }

    _countMergeLines(data, from, to) {
        const partOfData = data.slice(from, to + 1);

        return partOfData.filter(({ content }) => content === this.MERGE)
            .length;
    }

    _countBlockLength(data, from, to, rowNesting) {
        if (rowNesting && from + 1 >= data?.length) {
            return -1;
        }

        let startIndex = 0;

        if (rowNesting) {
            const nextRowStartsWithCurlyBrace =
                data[from + 1].content.startsWith('{');

            startIndex = nextRowStartsWithCurlyBrace ? from + 2 : from + 1;
        } else {
            startIndex = from + 1;
        }

        const partOfData = data.slice(startIndex, to);

        return partOfData.filter(
            ({ content }) => !this.CUSTOM_LINES.includes(content)
        ).length;
    }

    _findMatchingBlock(content) {
        return this.blocks.find(({ expression }) => content.match(expression));
    }

    _findRowNesting(contentNesting, row, nextRow) {
        const { index } = row;

        const currentRowNesting = contentNesting.find(
            ({ from }) => from === index
        );

        if (!nextRow || currentRowNesting) {
            return currentRowNesting;
        }

        return nextRow.content.startsWith('{') ? nextRow : null;
    }

    _getEndIndicatorIndex(data, block, row) {
        const { endIndicator } = block;
        const partOfData = data.slice(row.index);

        const foundRow = partOfData.find(
            ({ content, indentation }) =>
                content.match(endIndicator) && indentation >= row.indentation
        );

        return foundRow ? foundRow.index : -1;
    }

    _getEndIndex(block, row) {
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

    _reviewSingleLineBlocks(file, singleLineBlocks) {
        const reviewComments = [];

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
