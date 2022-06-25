const BaseRule = require('src/rules/Base');

class SimplePropertyAssignmentRule extends BaseRule {
    /**
     * @param {PatchronContext} patchronContext
     * @param {object} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);
    }

    invoke() {
        // ((\w+):.*?)[,|}] - single line or comma line
        // ((\w+):.*) - last, without comma

        const { splitPatch } = this.file;

        const data = this.setupData(splitPatch);
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const { trimmedContent } = row;

            if (
                trimmedContent.startsWith('@@') ||
                this.CUSTOM_LINES.includes(trimmedContent)
            ) {
                continue;
            }
        }
    }

    /**
     * @returns {string}
     */
    _getCommentBody() {
        return `TBA`;
    }
}

module.exports = SimplePropertyAssignmentRule;
