class KeywordsOrderedByLengthRule {
    /**
     * @param {object} config
     * @param {Array<{name: string, regex: string, order: 'ascending'|'descending', ignoreNewline: boolean }>} config.keywords
     * @param {string} config.keywords[].name - readable name
     * @param {string} config.keywords[].regex - regular expression to match keyword
     * @param {string} config.keywords[].order -
     * @param {string} config.keywords[].ignoreNewline - the name of an employee.
     */
    constructor(config) {
        const { keywords } = config;

        this.keywords = keywords;
    }

    invoke(file) {
        if (!this.keywords.length) {
            probotInstance.log.error(
                `Couldn't run rule ${__filename} on ${file.filename}. No keywords defined.`
            );

            return [];
        }

        const { split_patch: splitPatch } = file;

        for (let rowIndex = 0; rowIndex < splitPatch.length; rowIndex++) {
            // TODO:
        }

        let comments = [];

        return comments;
    }
}

module.exports = KeywordsOrderedByLengthRule;
