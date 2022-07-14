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
    }

    _includesAnyBlock(data) {
        return data.some(({ trimmedContent }) =>
            this.blocks.some((block) => trimmedContent.match(block.expression))
        );
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `TBA`;
    }
}

module.exports = SingleLineBlockRule;
