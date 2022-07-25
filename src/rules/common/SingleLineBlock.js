const BaseRule = require('src/rules/Base');

class SingleLineBlockRule extends BaseRule {
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

        if (!this._includesAnyBlock(data)) {
            return [];
        }

        const singleLineBlocks = this._getSingleLineBlocks(data);

        const reviewComments = this._reviewSingleLineBlocks(singleLineBlocks);

        return reviewComments;
    }

    _includesAnyBlock(data) {
        return data.some(({ trimmedContent }) =>
            this.blocks.some((block) => trimmedContent.match(block.expression))
        );
    }

    _getSingleLineBlocks(data) {
        const rowsToSkip = [];
        const singleLineBlocks = [];
        const dataStructure = this.helpers.getDataStructure(data);

        for (const { index, trimmedContent } of data) {
            if (
                rowsToSkip.includes(index) ||
                trimmedContent.startsWith(this.HUNK_HEADER_INDICATOR) ||
                this.CUSTOM_LINES.includes(trimmedContent)
            ) {
                continue;
            }

            const matchedBlock = this.blocks.find(({ expression }) =>
                trimmedContent.match(expression)
            );

            if (!matchedBlock) {
                continue;
            }

            let rowStructure = this._findRowStructure(
                index,
                data,
                dataStructure
            );

            let to = -1;
            let isWithBraces = false;
            let isSingleLineBlock = false;

            if (rowStructure) {
                to = rowStructure.to;

                isWithBraces = true;

                isSingleLineBlock = this._isSingleLineBlockWithBraces(
                    data,
                    rowStructure
                );
            } else if (matchedBlock?.countAsSingleLineBlockWhenNoBraces) {
                to = index;

                isSingleLineBlock = true;
            } else if (matchedBlock?.multiLineOptions) {
                const endIndex = this._findEndIndex(index, data, matchedBlock);

                if (~endIndex) {
                    rowsToSkip.push(endIndex);

                    rowStructure = this._findRowStructure(
                        endIndex,
                        data,
                        dataStructure
                    );

                    isSingleLineBlock = rowStructure
                        ? this._isSingleLineBlockWithBraces(data, rowStructure)
                        : this._isSingleLineBlockWithoutBraces(
                              data,
                              index,
                              endIndex
                          );

                    isWithBraces = !!rowStructure;

                    to = endIndex;
                }
            }

            if (isSingleLineBlock) {
                singleLineBlocks.push({
                    to,
                    from: index,
                    isWithBraces
                });
            }
        }

        return singleLineBlocks;
    }

    _findRowStructure(rowIndex, data, dataStructure) {
        const nextRow = rowIndex + 1 < data.length ? data[rowIndex + 1] : null;

        const currentRowStructure = dataStructure.find(
            ({ from }) => from === rowIndex
        );

        if (!nextRow || currentRowStructure) {
            return currentRowStructure;
        }

        const { trimmedContent } = nextRow;

        return trimmedContent.startsWith(this.BLOCK_START)
            ? dataStructure.find(({ from }) => from === nextRow.index)
            : null;
    }

    _findEndIndex(index, data, matchedBlock) {
        const { multiLineOptions } = matchedBlock;

        const multiLineStructure = this.helpers.getMultiLineStructure(
            data,
            index,
            multiLineOptions
        );

        return multiLineStructure?.endIndex || -1;
    }

    _isSingleLineBlockWithBraces(data, structure) {
        const { from, to } = structure;

        if (from === to) {
            return true;
        }

        let count = 0;

        for (let index = from + 1; index < to; index++) {
            const { trimmedContent } = data[index];

            trimmedContent === this.MERGE ? 0 : count++;
        }

        return count === 1;
    }

    _isSingleLineBlockWithoutBraces(data, index, endIndex) {
        const startRow = data[index];
        const dataLength = data.length;

        for (; endIndex < dataLength; endIndex++) {
            const { trimmedContent, indentation } = data[endIndex];

            if (
                trimmedContent === this.MERGE ||
                trimmedContent === this.COMMENTED_LINE
            ) {
                continue;
            }

            if (indentation > startRow.indentation) {
                return true;
            }

            return false;
        }

        return false;
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
