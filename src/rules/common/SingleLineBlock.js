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

        for (const { index: from, trimmedContent } of data) {
            if (
                rowsToSkip.includes(from) ||
                trimmedContent.startsWith('@@') ||
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
                from,
                data,
                dataStructure
            );

            let to = -1;
            let isWithBraces = false;
            let isSingleLineBlock = false;

            if (rowStructure) {
                to = rowStructure.to;

                isWithBraces = true;

                isSingleLineBlock = this._isSingleLineBlock(data, rowStructure);
            } else if (matchedBlock?.multiLineOptions) {
                const endIndex = this._findEndIndex(from, data, matchedBlock);

                if (~endIndex) {
                    rowsToSkip.push(endIndex);

                    rowStructure = this._findRowStructure(
                        endIndex,
                        data,
                        dataStructure
                    );

                    // TODO:!!!
                    const start = data[from].indentation;
                    const end = data[endIndex].indentation;
                    const nextEnd = data[endIndex + 1].indentation;

                    isSingleLineBlock = rowStructure
                        ? this._isSingleLineBlock(data, rowStructure)
                        : end >= start || nextEnd >= start;

                    isWithBraces = !!rowStructure;

                    to = endIndex;
                }
            }

            if (isSingleLineBlock) {
                singleLineBlocks.push({
                    to,
                    from,
                    isWithBraces
                });
            }
        }

        return singleLineBlocks;
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

    _findRowStructure(rowIndex, data, dataStructure) {
        const nextRow = rowIndex + 1 < data.length ? data[rowIndex + 1] : null;

        const currentRowStructure = dataStructure.find(
            ({ from }) => from === rowIndex
        );

        if (!nextRow || currentRowStructure) {
            return currentRowStructure;
        }

        const { trimmedContent } = nextRow;

        return trimmedContent.startsWith('{')
            ? dataStructure.find(({ from }) => from === nextRow.index)
            : null;
    }

    _isSingleLineBlock(data, structure) {
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
