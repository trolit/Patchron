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

            let to = -1;
            const from = row.index;

            const rowStructure = this._findRowStructure(
                data,
                dataStructure,
                index
            );

            const isWithBraces = !!rowStructure;

            if (rowStructure) {
                to = rowStructure.to;
            } else if (matchedBlock?.multiLineOptions) {
                to = this._resolveMultiLineStructure(data, matchedBlock, index);
            } else {
                continue;
            }

            if (this._isSingleLineBlock(data, from, to, isWithBraces)) {
                singleLineBlocks.push({
                    from,
                    to,
                    isWithBraces
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
