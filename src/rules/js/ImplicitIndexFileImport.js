/// <reference path="../../config/type-definitions/rules/js/ImplicitIndexFileImport.js" />

const BaseRule = require('src/rules/Base');

class ImplicitIndexFileImportRule extends BaseRule {
    /**
     * @param {PepegaContext} pepegaContext
     * @param {object} config
     * @param {Patch} file
     */
    constructor(pepegaContext, config, file) {
        super(pepegaContext, file);

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

    _reviewData(data, expression) {
        const reviewComments = [];
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

            const matchResult = trimmedContent.match(expression);

            if (!matchResult) {
                continue;
            }

            const matchedFragment = matchResult[0];

            if (matchedFragment.includes('index')) {
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
        return `Please do not reference file named \`index\` explicitly in ${
            this.type === this.MODULE ? 'import' : 'require'
        }.`;
    }
}

module.exports = ImplicitIndexFileImportRule;
