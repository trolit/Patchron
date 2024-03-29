const BaseRule = require('src/rules/Base');

class ImportWithoutExtensionRule extends BaseRule {
    /**
     * comments out `import/require` instructions which paths end with extensions
     *
     * @param {PatchronContext} patchronContext
     * @param {ImportWithoutExtensionConfig} config
     * @param {Patch} file
     */
    constructor(patchronContext, config, file) {
        super(patchronContext, file);

        const { type } = config;

        this.type = type;

        const MODULE = 'module';
        const COMMONJS = 'commonjs';

        this.MODULE = MODULE;
        this.COMMONJS = COMMONJS;

        this.availableTypes = [MODULE, COMMONJS];
    }

    invoke() {
        if (!this.availableTypes.includes(this.type)) {
            this.log.warning(
                __filename,
                'Unrecognized type in rule configuration',
                this.file
            );

            return [];
        }

        const { splitPatch } = this.file;
        const data = this.setupData(splitPatch);

        const reviewComments = this._reviewData(
            data,
            this.type === this.MODULE
                ? /from.*[(|'|"|`].*[)|'|"|`]/
                : /require.*\(.*\)/
        );

        return reviewComments;
    }

    _reviewData(data, regex) {
        const reviewComments = [];
        const dataLength = data.length;

        for (let index = 0; index < dataLength; index++) {
            const row = data[index];
            const { trimmedContent } = row;

            if (
                this.CUSTOM_LINES.includes(trimmedContent) ||
                trimmedContent.startsWith(this.HUNK_HEADER_INDICATOR)
            ) {
                continue;
            }

            const matchResult = trimmedContent.match(regex);

            if (!matchResult) {
                continue;
            }

            const matchedFragment = matchResult[0];
            const splitMatchedFragment = matchedFragment.split('/');

            const fileReference = splitMatchedFragment.pop();

            if (fileReference.includes('.')) {
                reviewComments.push(
                    this.getSingleLineComment({
                        body: this._getCommentBody(),
                        index
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
        return `Please, remove extension from marked ${
            this.type === this.MODULE ? 'import' : 'require'
        }.`;
    }
}

module.exports = ImportWithoutExtensionRule;
