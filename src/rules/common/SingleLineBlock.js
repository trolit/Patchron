const BaseRule = require('src/rules/Base');

// TODO: need to handle case that for loop is split into 3 lines due to formatting
class SingleLineBlockRule extends BaseRule {
    /**
     * Please note that:
     * - if provided block does not end by curly brace or single line, assign regular expression under `endIndicator` property to specify block end manually. For instance `endIndicator` of `do..while` could be ```/while/``` since we have no 100% certainity that it will always appear at the start of the line.
     * - if blocks have similiar parts, pay attention to their order e.g. if..else if..else and/or regular expression
     * - each block's expression should end with `.*`
     *
     * @param {PatchronContext} patchronContext
     * @param {SingleLineBlockConfig} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

        const { blocks, curlyBraces } = config;

        this.blocks = blocks;
        this.curlyBraces = curlyBraces;
    }

    invoke() {
        if (!this.blocks.length) {
            this.log.warning(__filename, 'No blocks defined', this.file);

            return [];
        }

        const { splitPatch } = this.file;
        const data = this.setupData(splitPatch);

        if (!this._includesAnyMatch(data)) {
            this.log.information(
                __filename,
                'Review skipped due to no single line blocks.',
                this.file
            );

            return [];
        }

        const dataStructure = this.helpers.getDataStructure(data);

        const singleLineBlocks = this._getSingleLineBlocks(data, dataStructure);

        const reviewComments = this._reviewSingleLineBlocks(singleLineBlocks);

        return reviewComments;
    }

    _includesAnyMatch(data) {
        return data.some(({ trimmedContent }) =>
            this.blocks.some((block) => trimmedContent.match(block.expression))
        );
    }

    _getSingleLineBlocks(data, dataStructure) {
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

            const rowStructure = this._findRowStructure(
                dataStructure,
                row,
                nextRow
            );

            let to = -1;
            const from = row.index;

            if (block?.endIndicator) {
                to = this._getEndIndicatorIndex(data, block, row);

                rowsToSkip.push(to);
            } else if (rowStructure) {
                to = rowStructure.to;
            } else {
                to = this._getEndIndex(block, row);
            }

            if (this._isSingleLineBlock(data, from, to, rowStructure)) {
                singleLineBlocks.push({
                    from,
                    to,
                    isWithBraces: !!rowStructure
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

    _findRowStructure(dataStructure, row, nextRow) {
        const { index } = row;

        const currentRowStructure = dataStructure.find(
            ({ from }) => from === index
        );

        if (!nextRow || currentRowStructure) {
            return currentRowStructure;
        }

        const { trimmedContent } = nextRow;

        return trimmedContent.startsWith('{')
            ? dataStructure.find(({ from }) => from === nextRow.index)
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
                trimmedContent === this.MERGE
            ) {
                continue;
            }

            result++;
        }

        return result || 1;
    }

    _reviewSingleLineBlocks(singleLineBlocks) {
        const reviewComments = [];

        for (const singleLineBlock of singleLineBlocks) {
            const { from, to, isWithBraces } = singleLineBlock;

            if (this.curlyBraces !== isWithBraces) {
                const body = this._getCommentBody();

                reviewComments.push(
                    from === to
                        ? this.getSingleLineComment({
                              index: from,
                              body
                          })
                        : this.getMultiLineComment({
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
