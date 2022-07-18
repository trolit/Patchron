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

        const dataStructure = this.helpers.getDataStructure(data);

        const singleLineBlocks = this._getSingleLineBlocks(data, dataStructure);
    }

    _includesAnyBlock(data) {
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
                rowsToSkip.includes(index) ||
                trimmedContent.startsWith('@@') ||
                this.CUSTOM_LINES.includes(content)
            ) {
                continue;
            }

            const matchedBlock = this.blocks.find(({ expression }) =>
                trimmedContent.match(expression)
            );

            if (!matchedBlock) {
                continue;
            }

            const rowStructure = this._findRowStructure(
                data,
                dataStructure,
                index
            );

            const from = row.index;
            let isWithBraces = false;
            let isSingleLineBlock = false;

            if (rowStructure) {
                isWithBraces = true;

                isSingleLineBlock = this._isSingleLineStructure(
                    data,
                    rowStructure
                );
            } else {
                const endIndex = this._resolveMultiLineStructure(
                    data,
                    matchedBlock,
                    index
                );
            }

            if (isSingleLineBlock) {
                singleLineBlocks.push({
                    from,
                    to
                });
            }
        }
    }

    _resolveMultiLineStructure(data, matchedBlock, index) {
        const { multiLineOptions } = matchedBlock;

        const multiLineStructure = this.helpers.getMultiLineStructure(
            data,
            index,
            multiLineOptions
        );

        return multiLineStructure?.endIndex || -1;
    }

    _findRowStructure(data, dataStructure, index) {
        const nextRow = index + 1 < data.length ? data[index + 1] : null;

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

    _isSingleLineStructure(data, structure) {
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

    _isSingleLineBlock(data, from, to, isWithBraces) {
        if (from === to) {
            return true;
        }

        const dataLength = data.length;

        if (isWithBraces) {
            for (let index = from + 1; index < dataLength; index++) {}
        }
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `TBA`;
    }
}

module.exports = SingleLineBlockRule;
