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
    constructor(pepegaContext, config) {
        super(pepegaContext);

        const { blocks, curlyBraces } = config;

        this.blocks = blocks;
        this.curlyBraces = curlyBraces;
    }

    invoke(file) {
        if (!this.blocks.length) {
            this.log.warning(__filename, 'No blocks defined', file);

            return [];
        }

        const { split_patch: splitPatch } = file;
        const data = this.setupData(splitPatch);

        if (!this._includesAnyMatch(data)) {
            this.log.warning(
                __filename,
                `${file?.filename} review skipped due to no single line blocks.`,
                file
            );

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
        return data.some(({ trimmedContent }) =>
            this.blocks.some((block) => trimmedContent.match(block.expression))
        );
    }

    _getSingleLineBlocks(data, contentNesting) {
        const rowsToSkip = [];
        const singleLineBlocks = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const { content, trimmedContent } = row;

            if (
                this.CUSTOM_LINES.includes(content) ||
                rowsToSkip.includes(index)
            ) {
                continue;
            }

            const block = this._findMatchingBlock(trimmedContent);

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

    _findMatchingBlock(trimmedContent) {
        return this.blocks.find(({ expression }) =>
            trimmedContent.match(expression)
        );
    }

    _findRowNesting(contentNesting, row, nextRow) {
        const { index } = row;

        const currentRowNesting = contentNesting.find(
            ({ from }) => from === index
        );

        if (!nextRow || currentRowNesting) {
            return currentRowNesting;
        }

        const { trimmedContent } = nextRow;

        return trimmedContent.startsWith('{')
            ? contentNesting.find(({ from }) => from === nextRow.index)
            : null;
    }

    _getEndIndicatorIndex(data, block, row) {
        const { endIndicator } = block;
        const partOfData = data.slice(row.index);

        const foundRow = partOfData.find(
            ({ trimmedContent, indentation }) =>
                trimmedContent.match(endIndicator) &&
                indentation >= row.indentation
        );

        return foundRow ? foundRow.index : -1;
    }

    _getEndIndex(block, row) {
        const { expression } = block;
        const { trimmedContent } = row;

        const expressionAsString = expression.toString().replace(/\//g, '');

        const rawBlockExpression = expressionAsString.endsWith('.*')
            ? expressionAsString.slice(0, -2)
            : expressionAsString;

        const rawBlockMatch = trimmedContent.match(rawBlockExpression);

        if (!rawBlockMatch) {
            return -1;
        }

        const rawBlock = rawBlockMatch[0];

        const contentLength = trimmedContent.length;
        const rawBlockLength = rawBlock.length;

        const extraBlockContent = trimmedContent.substr(rawBlockLength).trim();

        return contentLength > rawBlockLength &&
            !this.isLineCommented(extraBlockContent)
            ? row.index
            : row.index + 1;
    }

    _isSingleLineBlock(data, from, to, rowNesting) {
        return (
            from === to ||
            this._countBlockLength(data, from, to, rowNesting) === 1
        );
    }

    _countBlockLength(data, from, to, rowNesting) {
        let result = 0;
        const partOfData = data.slice(from + 1, to);
        const partofDataLength = partOfData.length;

        for (let index = 0; index < partofDataLength; index++) {
            const { trimmedContent } = partOfData[index];

            if (
                (rowNesting && ['{', '}'].includes(trimmedContent)) ||
                this.CUSTOM_LINES.includes(trimmedContent)
            ) {
                continue;
            }

            result++;
        }

        return result || 1;
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
